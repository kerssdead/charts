import Value from 'types/base/Value'
import * as Helper from 'Helper'
import Sector from 'types/Sector'
import PlotSeries from 'types/PlotSeries'
import Point from 'types/Point'
import Paddings from 'types/Paddings'
import RenderItem from 'types/RenderItem'
import Theme from 'Theme'
import Chart from 'Chart'
import Animations from 'Animations'
import Queue from 'render/Queue'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import TextResources from 'static/TextResources'
import * as Constants from 'static/constants/Index'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from 'static/constants/Index'
import { ChartType, HorizontalAlignment, LegendPlace, TextAlignment, VerticalAlignment } from 'static/Enums'
import ChartSettings from './types/ChartSettings'

/**
 * Legend item position on canvas in pixels
 */
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

    private readonly chart: Chart

    private area: DOMRect | undefined

    private entries: LegendEntry[] = []

    private button: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private items: Set<RenderItem> = new Set()

    private hover: Map<string, number> = new Map()

    private toggles: Map<string, number> = new Map()

    private timer: DOMHighResTimeStamp | null = null

    private isDirty: boolean = true

    get reserved(): Paddings {
        const reserved: Paddings = { top: 0, right: 0, bottom: 0, left: 0 }

        if (!this.area)
            return reserved

        switch (this.settings.legendPlace) {
            case LegendPlace.Top:
                reserved.top = this.area.height
                break

            case LegendPlace.Left:
                reserved.left = this.area.width
                break

            case LegendPlace.Right:
                reserved.right = this.area.width
                break

            case LegendPlace.Bottom:
            default:
                reserved.bottom = this.area.height
                break
        }

        return reserved
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

    constructor(chart: Chart) {
        this.chart = chart
        this.settings = chart.settings

        this.prepareValues()
    }

    applySettings(settings?: ChartSettings) {
        if (settings)
            this.settings = settings

        this.prepareValues()

        if (this.size)
            this.resize(this.size.width, this.size.height)
    }

    resize(width: number, height: number) {
        this.size = { width, height }

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
        const delta = (now - (this.timer ?? now)) / Constants.Animations.button
        this.timer = now

        const isToggling = this.updateToggles(now)
        const isHoverChanged = this.updateHover(mouse, delta)

        if (!this.isDirty && !isToggling && !isHoverChanged)
            return

        this.clear(queue)

        const added = queue.add((items: QueueItemsBuilder) => {
            const area = this.area!

            items.rect()
                 .position(this.x(area.x), this.y(area.y))
                 .size(this.width(area.width), this.height(area.height))
                 .fill()
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .color(Theme.canvasBackground)
                 .layer(Layer.Legend)
                 .fixed()
                 // renderer recolors clicked items, restore them
                 .onClick(() => {
                     this.isDirty = true
                 })

            for (const entry of this.entries)
                this.buildEntry(items, entry, this.getHover(entry.value.id))

            if (this.button)
                this.buildButton(items, this.button, this.getHover(Legend.resetKey))
        })

        this.items = new Set(added)
        this.isDirty = false
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
            areaY = this.settings.legendPlace == LegendPlace.Top ? 0 : height - areaHeight

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

        this.area = new DOMRect(areaX, 0, areaWidth, height)

        const buttonSpace = this.buttonWidth > 0 ? itemHeight + rowGap : 0,
            availableHeight = height - paddingY * 2 - buttonSpace,
            count = Math.min(Math.max(Math.floor((availableHeight + rowGap) / (itemHeight + rowGap)), 0), values.length),
            blockHeight = count * itemHeight + Math.max(count - 1, 0) * rowGap,
            startY = paddingY + buttonSpace + Math.max((availableHeight - blockHeight) / 2, 0)

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
        return this.settings.data.values.filter(value => !value.hideInLegend)
    }

    private toggle(value: Value) {
        this.isDirty = true

        if (this.toggles.has(value.id) || !value.checkCondition())
            return

        value.toggle(0)

        this.toggles.set(value.id, performance.now())

        this.onChange?.()
    }

    private reset() {
        this.toggles.clear()
        this.isDirty = true

        for (const value of this.settings.data.values)
            value.reset()

        this.onChange?.()
    }

    private updateToggles(now: DOMHighResTimeStamp) {
        const isToggling = this.toggles.size > 0

        for (const value of this.settings.data.values) {
            const start = this.toggles.get(value.id)

            if (start == undefined)
                continue

            const transition = Math.min((now - start) / Constants.Animations.legend, 1)

            if (transition > 0)
                value.toggle(transition)

            if (transition == 1)
                this.toggles.delete(value.id)
        }

        return isToggling
    }

    private updateHover(mouse: Point | null, delta: number) {
        let isChanged = false

        const step = (key: string, isOver: boolean) => {
            const current = this.hover.get(key) ?? 0,
                progress = Math.min(Math.max(current + (isOver ? delta : -delta), 0), 1)

            if (progress != current) {
                this.hover.set(key, progress)

                isChanged = true
            }
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
        return Animations.getTransition(this.hover.get(key) ?? 0)
    }

    private isOver(mouse: Point | null, x: number, y: number, width: number) {
        return !!mouse
               && x <= mouse.x && mouse.x <= x + width
               && y <= mouse.y && mouse.y <= y + Legend.itemHeight
    }

    private prepareValues() {
        this.settings.data.values = this.settings.data.values.map(value => {
            if (!(value instanceof Value))
                value = this.settings.type == ChartType.Plot
                        ? new PlotSeries(value)
                        : new Sector(value)

            value.id ??= Helper.guid()
            value.label ??= TextResources.noLabel

            if (value instanceof Sector)
                value.current ??= value.value

            return value
        })
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