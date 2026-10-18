import Value from '@/types/base/Value'
import { clamp, contains, grayScale, lerp, maxOf, stringWidth, sum } from '@/Helper'
import Point from '@/types/Point'
import Paddings, { NO_PADDINGS } from '@/types/Paddings'
import RenderItem from '@/types/RenderItem'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import TextResources from '@/static/TextResources'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { ChartType, HorizontalAlignment, LegendPlace, TextAlignment, VerticalAlignment } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import ChartItem from '@/types/ChartItem'
import HoverProgress from '@/types/HoverProgress'
import { ease } from '@/Animations'

type LegendEntry = {
    value: Value
    label: string
    x: number
    y: number
    width: number
}

class Legend extends Overlay {
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

    private units: Units = Units.fromSize(1, 1)

    private top: number = 0

    private backgrounds: Map<string, RenderItem> = new Map()

    private hover: Map<string, HoverProgress> = new Map()

    private toggles: Map<string, DOMHighResTimeStamp | null> = new Map()

    private isDirty: boolean = true

    private moveStart: DOMHighResTimeStamp | null = null

    private isMovePending: boolean = false

    private from: Map<string, Point> = new Map()

    private fromArea: DOMRect | undefined

    private leaving: LegendEntry[] = []

    private values: Value[] = []

    private isHoverAnimating: boolean = false

    get reserved(): Paddings {
        return this.getReserved(this.area)
    }

    getCurrentReserved(now: DOMHighResTimeStamp): Paddings {
        return this.getReserved(this.area && this.getArea(this.getMoveProgress(now)))
    }

    get isMoving() {
        return this.isMovePending || this.moveStart != null
    }

    private getReserved(area: DOMRect | undefined): Paddings {
        const reserved = { ...NO_PADDINGS }

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
               : stringWidth(TextResources.reset) + 12
    }

    constructor(settings: ChartSettings) {
        super()

        this.settings = settings
        this.values = Legend.getValues(settings)
    }

    private static getValues(settings: ChartSettings): Value[] {
        return settings.charts.filter(Legend.isSupported).flatMap(chart => chart.data.values)
    }

    applySettings(settings?: ChartSettings) {
        const previous = this.entries
        const previousArea = this.area

        if (settings) {
            this.settings = settings
            this.values = Legend.getValues(settings)
        }

        if (this.size)
            this.resize(this.size.width, this.size.height, this.top)

        const ids = new Set(this.entries.map(entry => entry.value.id))

        for (const key of this.hover.keys())
            if (key != Legend.resetKey && !ids.has(key))
                this.hover.delete(key)

        if (settings && previous.length > 0)
            this.move(previous, previousArea)
    }

    resize(width: number, height: number, top: number = 0) {
        this.size = { width, height }
        this.units = Units.fromSize(width, height)
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

    build(queue: Queue, mouse: Point | null, now: DOMHighResTimeStamp): boolean {
        if (!this.area || !this.size || this.size.width <= 0 || this.size.height <= 0) {
            this.clear(queue)

            return false
        }

        if (this.isMovePending) {
            this.moveStart = now
            this.isMovePending = false
        }

        this.updateToggles(now)

        const isHoverChanged = this.updateHover(mouse, now)
        const isMoving = this.moveStart != null

        if (!this.isDirty && !isMoving) {
            if (isHoverChanged)
                this.updateBackgrounds()

            return this.isAnimating
        }

        const progress = this.getMoveProgress(now)

        this.clear(queue)

        const builder = new QueueItemsBuilder()
        const area = this.getArea(progress)

        builder.rect()
               .position(this.units.x(area.x), this.units.y(area.y))
               .size(this.units.x(area.width), this.units.y(area.height))
               .fill()
               .align(HorizontalAlignment.Left, VerticalAlignment.Top)
               .color(Theme.canvasBackground)
               .layer(Layer.Legend)
               .fixed()
               .onClick(() => {
                   this.isDirty = true
               })

        const resetBackground = this.button && this.buildButton(builder, this.button, this.getHover(Legend.resetKey))
        const added = builder.dispose()

        if (resetBackground)
            this.backgrounds.set(Legend.resetKey, resetBackground)

        this.entries.forEach(entry => {
            const from = this.from.get(this.getKey(entry.value))

            const current = from
                            ? {
                    ...entry,
                    x: lerp(from.x, entry.x, progress),
                    y: lerp(from.y, entry.y, progress)
                }
                            : entry

            const { items, background } = this.createEntry(current, this.getHover(entry.value.id), from ? 1 : progress)

            this.backgrounds.set(entry.value.id, background)

            added.push(...items)
        })

        for (const entry of this.leaving)
            added.push(...this.createEntry(entry, 0, 1 - progress).items)

        if (progress == 1) {
            this.moveStart = null
            this.from.clear()
            this.fromArea = undefined
            this.leaving = []
        }

        this.show(queue, added)

        this.isDirty = false

        return this.isAnimating
    }

    private get isAnimating() {
        return this.isHoverAnimating || this.isMoving || this.toggles.size > 0
    }

    private move(previous: LegendEntry[], previousArea: DOMRect | undefined) {
        this.fromArea = previousArea
        const keys = new Set(this.entries.map(entry => this.getKey(entry.value)))

        this.from = new Map(previous.map(entry => [this.getKey(entry.value), { x: entry.x, y: entry.y }]))
        this.leaving = previous.filter(entry => !keys.has(this.getKey(entry.value)))
        this.moveStart = null
        this.isMovePending = true
        this.isDirty = true
    }

    private getArea(progress: number) {
        const area = this.area!
        const from = this.fromArea

        if (!from)
            return area

        return new DOMRect(lerp(from.x, area.x, progress), lerp(from.y, area.y, progress),
            lerp(from.width, area.width, progress), lerp(from.height, area.height, progress))
    }

    private getMoveProgress(now: DOMHighResTimeStamp) {
        if (this.moveStart == null)
            return 1

        const progress = Math.min((now - this.moveStart) / AnimationTiming.legend, 1)

        return progress == 1 ? 1 : ease(progress)
    }

    private createEntry(entry: LegendEntry, hover: number, alpha: number) {
        const builder = new QueueItemsBuilder()
        const background = this.buildEntry(builder, entry, hover)
        const items = builder.dispose()

        for (const item of items)
            item.animation.alpha = alpha

        return { items, background }
    }

    clear(queue: Queue) {
        this.isDirty = true
        this.backgrounds.clear()

        this.remove(queue)
    }

    destroy() {
        this.hover.clear()
        this.toggles.clear()
        this.entries = []
        this.area = undefined
    }

    private buildEntry(items: QueueItemsBuilder, entry: LegendEntry, hover: number) {
        const { value, label, x, y, width } = entry
        const centerY = y + Legend.itemHeight / 2
        const textX = x + 22
        const textColor = value.disabled ? Theme.text + '7f' : Theme.text

        const background = items.rect()
             .position(this.units.x(x), this.units.y(y))
             .size(this.units.x(width), this.units.y(Legend.itemHeight))
             .round(this.units.x(6))
             .fill()
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.hoverBackground(hover))
             .layer(Layer.Legend + 1)
             .fixed()
             .onClick(() => {
                 this.toggle(value)
             })

        items.arc()
             .position(this.units.x(x + 11), this.units.y(centerY))
             .radius(this.units.x(3))
             .fill()
             .color(value.disabled ? grayScale(value.color) : value.color)
             .layer(Layer.Legend + 2)
             .fixed()

        items.text(label)
             .position(this.units.x(textX), this.units.y(centerY))
             .size(Legend.fontSize)
             .align(TextAlignment.Left)
             .color(textColor)
             .layer(Layer.Legend + 2)
             .fixed()

        if (value.disabled)
            items.line()
                 .stop(this.units.x(textX), this.units.y(centerY + 1))
                 .stop(this.units.x(textX + stringWidth(label)), this.units.y(centerY + 1))
                 .color(textColor)
                 .layer(Layer.Legend + 2)
                 .fixed()

        return background.dispose()
    }

    private buildButton(items: QueueItemsBuilder, button: DOMRect, hover: number) {
        const background = items.rect()
             .position(this.units.x(button.x), this.units.y(button.y))
             .size(this.units.x(button.width), this.units.y(button.height))
             .round(this.units.x(4))
             .fill()
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.hoverBackground(hover))
             .layer(Layer.Legend + 1)
             .fixed()
             .onClick(() => {
                 this.reset()
             })

        items.text(TextResources.reset)
             .position(this.units.x(button.x + button.width / 2), this.units.y(button.y + button.height / 2))
             .size(Legend.fontSize)
             .align(TextAlignment.Center)
             .color(Theme.text)
             .layer(Layer.Legend + 2)
             .fixed()

        return background.dispose()
    }

    private calculateHorizontal(width: number, height: number) {
        const { paddingX, paddingY, itemHeight, rowGap, itemGap } = Legend

        const buttonSpace = this.buttonWidth > 0 ? this.buttonWidth + itemGap : 0
        const available = Math.max(width - (paddingX + buttonSpace) * 2, 0)
        const maxRows = Math.max(Math.floor((height / 4 - paddingY * 2 + rowGap) / (itemHeight + rowGap)), 1)

        const rows: LegendEntry[][] = []
        let row: LegendEntry[] = []
        let rowWidth = 0

        for (const value of this.visibleValues()) {
            const label = Legend.truncate(value.label, available - Legend.itemExtraWidth)
            const itemWidth = stringWidth(label) + Legend.itemExtraWidth

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

        const rowsCount = Math.max(rows.length, 1)
        const areaHeight = paddingY * 2 + rowsCount * itemHeight + (rowsCount - 1) * rowGap
        const areaY = this.settings.legendPlace == LegendPlace.Top ? this.top : height - areaHeight

        this.area = new DOMRect(0, areaY, width, areaHeight)

        this.entries = []

        rows.forEach((items, index) => {
            const total = sum(items, item => item.width) + (items.length - 1) * itemGap

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

        const values = this.visibleValues()
        const widest = maxOf(values, value => stringWidth(value.label)) + Legend.itemExtraWidth
        const areaWidth = Math.min(Math.max(widest, this.buttonWidth) + paddingX * 2, width / 4)
        const available = areaWidth - paddingX * 2
        const areaX = this.settings.legendPlace == LegendPlace.Left ? 0 : width - areaWidth

        this.area = new DOMRect(areaX, this.top, areaWidth, height - this.top)

        const buttonSpace = this.buttonWidth > 0 ? itemHeight + rowGap : 0
        const availableHeight = height - this.top - paddingY * 2 - buttonSpace
        const count = clamp(Math.floor((availableHeight + rowGap) / (itemHeight + rowGap)), 0, values.length)
        const blockHeight = count * itemHeight + Math.max(count - 1, 0) * rowGap
        const startY = this.top + paddingY + buttonSpace + Math.max((availableHeight - blockHeight) / 2, 0)

        this.entries = values.slice(0, count).map((value, index) => {
            const label = Legend.truncate(value.label, available - Legend.itemExtraWidth)

            return {
                value,
                label,
                x: 0,
                y: startY + index * (itemHeight + rowGap),
                width: Math.min(stringWidth(label) + Legend.itemExtraWidth, available)
            }
        })

        const blockWidth = maxOf(this.entries, entry => entry.width)

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
                item.disabled = !disabled

        this.toggles.set(key, null)

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
        for (const [key, start] of this.toggles) {
            if (start == null)
                this.toggles.set(key, now)
            else if (now - start >= AnimationTiming.legend)
                this.toggles.delete(key)
        }
    }

    private updateHover(mouse: Point | null, now: DOMHighResTimeStamp) {
        let isChanged = false

        this.isHoverAnimating = false

        const step = (key: string, isOver: boolean) => {
            let hover = this.hover.get(key)

            if (!hover)
                this.hover.set(key, hover = new HoverProgress())

            isChanged = hover.step(isOver, now, AnimationTiming.button) || isChanged

            this.isHoverAnimating ||= hover.isAnimating
        }

        for (const entry of this.entries) {
            const isOver = this.isOver(mouse, entry.x, entry.y, entry.width)

            step(entry.value.id, isOver)
        }

        if (this.button)
            step(Legend.resetKey, contains(this.button, mouse))

        return isChanged
    }

    private updateBackgrounds() {
        for (const [key, item] of this.backgrounds)
            item.color = Theme.hoverBackground(this.getHover(key))
    }

    private getHover(key: string) {
        return this.hover.get(key)?.value ?? 0
    }

    private isOver(mouse: Point | null, x: number, y: number, width: number) {
        return contains({ x, y, width, height: Legend.itemHeight }, mouse)
    }

    private static truncate(label: string, maxWidth: number) {
        if (stringWidth(label) <= maxWidth)
            return label

        let low = 0
        let high = label.length - 1

        while (low < high) {
            const middle = Math.ceil((low + high) / 2)

            if (stringWidth(label.slice(0, middle) + '…') <= maxWidth)
                low = middle
            else
                high = middle - 1
        }

        return label.slice(0, low) + '…'
    }
}

export default Legend