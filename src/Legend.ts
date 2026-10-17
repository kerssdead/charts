import Value from 'types/base/Value'
import * as Helper from 'Helper'
import Sector from 'types/Sector'
import PlotSeries from 'types/PlotSeries'
import Point from 'types/Point'
import Paddings from 'types/Paddings'
import RenderItem from 'types/RenderItem'
import Theme from 'Theme'
import Queue from 'render/Queue'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import TextResources from 'static/TextResources'
import * as Constants from 'static/constants/Index'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from 'static/constants/Index'
import { ChartType, HorizontalAlignment, LegendPlace, TextAlignment, VerticalAlignment } from 'static/Enums'
import ChartSettings from './types/ChartSettings'
import ChartItem from 'types/ChartItem'
import HoverProgress from 'types/HoverProgress'
import Animations from 'Animations'

type LegendEntry = {
    value: Value
    label: string
    x: number
    y: number
    width: number
}

class Legend {
    private static readonly paddingX = 12

    private static readonly paddingY = 4

    private static readonly itemHeight = 20

    private static readonly rowGap = 4

    private static readonly itemGap = 12

    private static readonly itemExtraWidth = 30

    private static readonly fontSize = 14

    private static readonly resetKey = 'reset'

    settings: ChartSettings

    onChange: (() => void) | undefined

    private area: DOMRect | undefined

    private entries: LegendEntry[] = []

    private button: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private top: number = 0

    private items: Set<RenderItem> = new Set()

    private hover: Map<string, HoverProgress> = new Map()

    private toggles: Map<string, number> = new Map()

    private isDirty: boolean = true

    private moveStart: DOMHighResTimeStamp | null = null

    private from: Map<number, Point> = new Map()

    private fromArea: DOMRect | undefined

    private leaving: LegendEntry[] = []

    get reserved(): Paddings {
        return this.getReserved(this.area)
    }

    get currentReserved(): Paddings {
        return this.getReserved(this.area && this.getArea(this.getMoveProgress(performance.now())))
    }

    get isMoving() {
        return this.moveStart != null
    }

    private getReserved(area: DOMRect | undefined): Paddings {
        const reserved: Paddings = { top: 0, right: 0, bottom: 0, left: 0 }

        if (!area)
            return reserved

        switch (this.settings.legendPlace) {
            case LegendPlace.Top:
                reserved.top = area.height
                break

            case LegendPlace.Left:
                reserved.left = area.width
                break

            case LegendPlace.Right:
                reserved.right = area.width
                break

            case LegendPlace.Bottom:
            default:
                reserved.bottom = area.height
                break
        }

        return reserved
    }

    private get isShared() {
        return this.settings.charts.length > 1
    }

    private get values(): Value[] {
        return this.settings.charts.filter(Legend.isSupported).flatMap(chart => chart.data.values)
    }

    static isSupported(chart: ChartItem) {
        return chart.type != ChartType.Gauge
               && (chart.type != ChartType.TreeMap || (chart.data?.values?.length ?? 0) > 1)
    }

    static getGroupKey(value: Value, isShared: boolean) {
        return isShared ? value.label : value.id
    }

    private get isVertical() {
        return this.settings.legendPlace == LegendPlace.Left
               || this.settings.legendPlace == LegendPlace.Right
    }

    private get buttonWidth() {
        return this.settings.disableInteractions
               ? 0
               : Helper.stringWidth(TextResources.reset) + 12
    }

    constructor(settings: ChartSettings) {
        this.settings = settings

        this.prepareValues()
    }

    applySettings(settings?: ChartSettings) {
        const previous = this.entries
        const previousArea = this.area

        if (settings)
            this.settings = settings

        this.prepareValues()

        if (this.size)
            this.resize(this.size.width, this.size.height, this.top)

        if (settings && previous.length > 0)
            this.move(previous, previousArea)
    }

    resize(width: number, height: number, top: number = 0) {
        this.size = { width, height }
        this.top = top

        if (this.isVertical)
            this.calculateVertical(width, height)
        else
            this.calculateHorizontal(width, height)

        this.button = this.settings.disableInteractions
                      ? undefined
                      : new DOMRect(this.area!.x + this.area!.width - Legend.paddingX - this.buttonWidth,
                          this.area!.y + Legend.paddingY,
                          this.buttonWidth,
                          Legend.itemHeight)

        this.isDirty = true
    }

    build(queue: Queue, mouse: Point | null) {
        if (!this.area || !this.size || this.size.width <= 0 || this.size.height <= 0) {
            this.clear(queue)

            return
        }

        const now = performance.now()

        const isToggling = this.updateToggles(now)
        const isHoverChanged = this.updateHover(mouse, now)
        const isMoving = this.moveStart != null

        if (!this.isDirty && !isToggling && !isHoverChanged && !isMoving)
            return

        const progress = this.getMoveProgress(now)

        this.clear(queue)

        const added = queue.add((items: QueueItemsBuilder) => {
            const area = this.getArea(progress)

            items.rect()
                 .position(this.x(area.x), this.y(area.y))
                 .size(this.width(area.width), this.height(area.height))
                 .fill()
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .color(Theme.canvasBackground)
                 .layer(Layer.Legend)
                 .fixed()
                 .onClick(() => {
                     this.isDirty = true
                 })

            if (this.button)
                this.buildButton(items, this.button, this.getHover(Legend.resetKey))
        })

        this.entries.forEach((entry, index) => {
            const from = this.from.get(index)

            const current = from
                            ? {
                    ...entry,
                    x: from.x + (entry.x - from.x) * progress,
                    y: from.y + (entry.y - from.y) * progress
                }
                            : entry

            added.push(...this.addEntry(queue, current, this.getHover(entry.value.id), from ? 1 : progress))
        })

        for (const entry of this.leaving)
            added.push(...this.addEntry(queue, entry, 0, 1 - progress))

        if (progress == 1) {
            this.moveStart = null
            this.from.clear()
            this.fromArea = undefined
            this.leaving = []
        }

        this.items = new Set(added)
        this.isDirty = false
    }

    private move(previous: LegendEntry[], previousArea: DOMRect | undefined) {
        this.fromArea = previousArea
        this.from = new Map(previous.map((entry, index) => [index, { x: entry.x, y: entry.y }]))
        this.leaving = previous.slice(this.entries.length)
        this.moveStart = performance.now()
        this.isDirty = true
    }

    private getArea(progress: number) {
        const area = this.area!
        const from = this.fromArea

        if (!from)
            return area

        const lerp = (start: number, end: number) => start + (end - start) * progress

        return new DOMRect(lerp(from.x, area.x), lerp(from.y, area.y),
            lerp(from.width, area.width), lerp(from.height, area.height))
    }

    private getMoveProgress(now: DOMHighResTimeStamp) {
        if (this.moveStart == null)
            return 1

        const progress = Math.min((now - this.moveStart) / Constants.Animations.legend, 1)

        return progress == 1 ? 1 : Animations.getTransition(progress)
    }

    private addEntry(queue: Queue, entry: LegendEntry, hover: number, alpha: number) {
        const added = queue.add((items: QueueItemsBuilder) => {
            this.buildEntry(items, entry, hover)
        })

        for (const item of added)
            item.animation.alpha = alpha

        return added
    }

    clear(queue: Queue) {
        this.isDirty = true

        if (this.items.size == 0)
            return

        queue.queue = queue.queue.filter(item => !this.items.has(item))

        this.items.clear()
    }

    destroy() {
        this.hover.clear()
        this.toggles.clear()
        this.entries = []
        this.area = undefined
    }

    private buildEntry(items: QueueItemsBuilder, entry: LegendEntry, hover: number) {
        const { value, label, x, y, width } = entry,
            centerY = y + Legend.itemHeight / 2,
            textX = x + 22,
            textColor = value.disabled ? Theme.text + '7f' : Theme.text

        items.rect()
             .position(this.x(x), this.y(y))
             .size(this.width(width), this.height(Legend.itemHeight))
             .round([6, 6, 6, 6])
             .fill()
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Helper.adjustColor(Theme.canvasBackground, Math.round(-25 * hover)))
             .layer(Layer.Legend + 1)
             .fixed()
             .onClick(() => {
                 this.toggle(value)
             })

        items.arc()
             .position(this.x(x + 11), this.y(centerY))
             .radius(this.width(3))
             .fill()
             .color(value.disabled ? Helper.grayScale(value.color) : value.color)
             .layer(Layer.Legend + 2)
             .fixed()

        items.text(label)
             .position(this.x(textX + Legend.fontSize / 2), this.y(centerY))
             .size(Legend.fontSize)
             .align(TextAlignment.Left)
             .color(textColor)
             .layer(Layer.Legend + 2)
             .fixed()

        if (value.disabled)
            items.line()
                 .stop(this.x(textX), this.y(centerY + 1))
                 .stop(this.x(textX + Helper.stringWidth(label)), this.y(centerY + 1))
                 .color(textColor)
                 .layer(Layer.Legend + 2)
                 .fixed()
    }

    private buildButton(items: QueueItemsBuilder, button: DOMRect, hover: number) {
        items.rect()
             .position(this.x(button.x), this.y(button.y))
             .size(this.width(button.width), this.height(button.height))
             .round([4, 4, 4, 4])
             .fill()
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Helper.adjustColor(Theme.canvasBackground, Math.round(-25 * hover)))
             .layer(Layer.Legend + 1)
             .fixed()
             .onClick(() => {
                 this.reset()
             })

        items.text(TextResources.reset)
             .position(this.x(button.x + button.width / 2 + Legend.fontSize / 2), this.y(button.y + button.height / 2))
             .size(Legend.fontSize)
             .align(TextAlignment.Center)
             .color(Theme.text)
             .layer(Layer.Legend + 2)
             .fixed()
    }

    private calculateHorizontal(width: number, height: number) {
        const { paddingX, paddingY, itemHeight, rowGap, itemGap } = Legend

        const buttonSpace = this.buttonWidth > 0 ? this.buttonWidth + itemGap : 0,
            available = Math.max(width - (paddingX + buttonSpace) * 2, 0),
            maxRows = Math.max(Math.floor((height / 4 - paddingY * 2 + rowGap) / (itemHeight + rowGap)), 1)

        let rows: LegendEntry[][] = [],
            row: LegendEntry[] = [],
            rowWidth = 0

        for (const value of this.visibleValues()) {
            const label = Legend.truncate(value.label, available - Legend.itemExtraWidth),
                itemWidth = Helper.stringWidth(label) + Legend.itemExtraWidth

            if (row.length > 0 && rowWidth + itemGap + itemWidth > available) {
                rows.push(row)

                row = []
                rowWidth = 0
            }

            if (rows.length == maxRows)
                break

            rowWidth += (row.length > 0 ? itemGap : 0) + itemWidth

            row.push({ value, label, x: 0, y: 0, width: itemWidth })
        }

        if (row.length > 0 && rows.length < maxRows)
            rows.push(row)

        const rowsCount = Math.max(rows.length, 1),
            areaHeight = paddingY * 2 + rowsCount * itemHeight + (rowsCount - 1) * rowGap,
            areaY = this.settings.legendPlace == LegendPlace.Top ? this.top : height - areaHeight

        this.area = new DOMRect(0, areaY, width, areaHeight)

        this.entries = []

        rows.forEach((items, index) => {
            const total = items.reduce((acc, item) => { return acc + item.width }, 0) + (items.length - 1) * itemGap

            let x = (width - total) / 2

            for (const item of items) {
                item.x = x
                item.y = areaY + paddingY + index * (itemHeight + rowGap)

                x += item.width + itemGap

                this.entries.push(item)
            }
        })
    }

    private calculateVertical(width: number, height: number) {
        const { paddingX, paddingY, itemHeight, rowGap } = Legend

        const values = this.visibleValues(),
            widest = Math.max(0, ...values.map(value => Helper.stringWidth(value.label))) + Legend.itemExtraWidth,
            areaWidth = Math.min(Math.max(widest, this.buttonWidth) + paddingX * 2, width / 4),
            available = areaWidth - paddingX * 2,
            areaX = this.settings.legendPlace == LegendPlace.Left ? 0 : width - areaWidth

        this.area = new DOMRect(areaX, this.top, areaWidth, height - this.top)

        const buttonSpace = this.buttonWidth > 0 ? itemHeight + rowGap : 0,
            availableHeight = height - this.top - paddingY * 2 - buttonSpace,
            count = Math.min(Math.max(Math.floor((availableHeight + rowGap) / (itemHeight + rowGap)), 0), values.length),
            blockHeight = count * itemHeight + Math.max(count - 1, 0) * rowGap,
            startY = this.top + paddingY + buttonSpace + Math.max((availableHeight - blockHeight) / 2, 0)

        this.entries = values.slice(0, count).map((value, index) => {
            const label = Legend.truncate(value.label, available - Legend.itemExtraWidth)

            return {
                value,
                label,
                x: 0,
                y: startY + index * (itemHeight + rowGap),
                width: Math.min(Helper.stringWidth(label) + Legend.itemExtraWidth, available)
            }
        })

        const blockWidth = Math.max(0, ...this.entries.map(entry => entry.width))

        for (const entry of this.entries)
            entry.x = areaX + (areaWidth - blockWidth) / 2
    }

    private visibleValues(): Value[] {
        const keys = new Set<string>()

        return this.values.filter(value => {
            const key = this.getKey(value)

            if (value.hideInLegend || keys.has(key))
                return false

            keys.add(key)

            return true
        })
    }

    private getKey(value: Value) {
        return Legend.getGroupKey(value, this.isShared)
    }

    private toggle(value: Value) {
        this.isDirty = true

        const key = this.getKey(value)

        if (this.toggles.has(key) || !value.checkCondition())
            return

        const disabled = value.disabled

        for (const item of this.values)
            if (this.getKey(item) == key && item.disabled == disabled)
                item.toggle(0)

        this.toggles.set(key, performance.now())

        this.onChange?.()
    }

    private reset() {
        this.toggles.clear()
        this.isDirty = true

        for (const value of this.values)
            value.reset()

        this.onChange?.()
    }

    private updateToggles(now: DOMHighResTimeStamp) {
        const isToggling = this.toggles.size > 0
        const finished = new Set<string>()

        for (const value of this.values) {
            const key = this.getKey(value)
            const start = this.toggles.get(key)

            if (start == undefined)
                continue

            const transition = Math.min((now - start) / Constants.Animations.legend, 1)

            if (transition > 0)
                value.toggle(transition)

            if (transition == 1)
                finished.add(key)
        }

        for (const key of finished)
            this.toggles.delete(key)

        return isToggling
    }

    private updateHover(mouse: Point | null, now: DOMHighResTimeStamp) {
        let isChanged = false

        const step = (key: string, isOver: boolean) => {
            let hover = this.hover.get(key)

            if (!hover)
                this.hover.set(key, hover = new HoverProgress())

            isChanged = hover.step(isOver, now, Constants.Animations.button) || isChanged
        }

        for (const entry of this.entries) {
            const isOver = this.isOver(mouse, entry.x, entry.y, entry.width)

            step(entry.value.id, isOver)
        }

        if (this.button)
            step(Legend.resetKey, this.isOver(mouse, this.button.x, this.button.y, this.button.width))

        return isChanged
    }

    private getHover(key: string) {
        return this.hover.get(key)?.value ?? 0
    }

    private isOver(mouse: Point | null, x: number, y: number, width: number) {
        return !!mouse
               && x <= mouse.x && mouse.x <= x + width
               && y <= mouse.y && mouse.y <= y + Legend.itemHeight
    }

    private prepareValues() {
        for (const chart of this.settings.charts.filter(Legend.isSupported)) {
            chart.data.values = chart.data.values.map(value => {
                if (!(value instanceof Value))
                    value = chart.type == ChartType.Plot
                            ? new PlotSeries(value)
                            : new Sector(value)

                value.id ??= Helper.guid()
                value.label ??= TextResources.noLabel

                if (value instanceof Sector)
                    value.current ??= value.value

                return value
            })
        }
    }

    private x(value: number) {
        return value * COORDS_MAX_X / this.size!.width
    }

    private y(value: number) {
        return value * COORDS_MAX_Y / this.size!.height
    }

    private width(value: number) {
        return this.x(value)
    }

    private height(value: number) {
        return this.y(value)
    }

    private static truncate(label: string, maxWidth: number) {
        if (Helper.stringWidth(label) <= maxWidth)
            return label

        let result = label

        while (result.length > 0 && Helper.stringWidth(result + '…') > maxWidth)
            result = result.slice(0, -1)

        return result + '…'
    }
}

export default Legend