import Value from '@/types/base/Value'
import { clamp, contains, lerp } from '@/helpers/Geometry'
import { grayScale, withAlpha } from '@/helpers/Color'
import { groupBy, maxOf, sum } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'
import Point from '@/types/Point'
import Frame from '@/types/Frame'
import Paddings, { NO_PADDINGS } from '@/types/Paddings'
import RenderItem from '@/types/RenderItem'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import TextResources from '@/static/TextResources'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { ChartType, LegendPlace, TextAlignment } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import ChartItem from '@/types/ChartItem'
import HoverMap from '@/types/HoverMap'
import ease from '@/animation/Animations'

const PADDING_X = 12

const PADDING_Y = 4

const ITEM_HEIGHT = 20

const ROW_GAP = 4

const ITEM_GAP = 12

const ITEM_EXTRA_WIDTH = 30

const FONT_SIZE = 14

const RESET_KEY = 'reset'

const SIDES: { [key in LegendPlace]: keyof Paddings } = {
    [LegendPlace.Bottom]: 'bottom',
    [LegendPlace.Left]: 'left',
    [LegendPlace.Top]: 'top',
    [LegendPlace.Right]: 'right'
}

type LegendEntry = {
    value: Value
    label: string
    x: number
    y: number
    width: number
}

class Legend extends Overlay {
    settings: ChartSettings

    onChange: (() => void) | undefined

    private area: DOMRect | undefined

    private entries: LegendEntry[] = []

    private button: DOMRect | undefined

    private size: { width: number, height: number } | undefined

    private units: Units = Units.fromSize(1, 1)

    private top: number = 0

    private backgrounds: Map<string, RenderItem> = new Map()

    private readonly hover = new HoverMap<string>()

    private toggles: Map<string, DOMHighResTimeStamp | null> = new Map()

    private isDirty: boolean = true

    private moveStart: DOMHighResTimeStamp | null = null

    private isMovePending: boolean = false

    private from: Map<string, Point> = new Map()

    private fromArea: DOMRect | undefined

    private leaving: LegendEntry[] = []

    private values: Value[] = []

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

        const side = SIDES[this.settings.legendPlace] ?? 'bottom'

        reserved[side] = this.isVertical ? area.width : area.height

        return reserved
    }

    private get isShared() {
        return this.settings.charts.length > 1
    }

    static isSupported(chart: ChartItem) {
        return chart.type != ChartType.Gauge
               && chart.type != ChartType.SegmentedBar
               && (chart.type != ChartType.TreeMap || (chart.data?.values?.length ?? 0) > 1)
    }

    static getGroupKey(value: Value, isShared: boolean) {
        return isShared ? `${ value.label }-${ value.labelIndex }` : value.id
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

        if (settings && previous.length > 0 && !settings.staticMode)
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
                      : new DOMRect(this.area!.x + this.area!.width - PADDING_X - this.buttonWidth,
                          this.area!.y + PADDING_Y,
                          this.buttonWidth,
                          ITEM_HEIGHT)

        this.isDirty = true
    }

    update({ queue, mouse, now }: Frame): boolean {
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
               .box(this.units, area)
               .fill()
               .color(Theme.canvasBackground)
               .layer(Layer.Legend)
               .fixed()
               .onClick(() => {
                   this.isDirty = true
               })

        const resetBackground = this.button && this.buildButton(builder, this.button, this.hover.value(RESET_KEY))
        const added = builder.dispose()

        if (resetBackground)
            this.backgrounds.set(RESET_KEY, resetBackground)

        this.entries.forEach(entry => {
            const from = this.from.get(this.getKey(entry.value))
            const current = this.getCurrent(entry, progress)

            const { items, background } = this.createEntry(current, this.hover.value(entry.value.id), from ? 1 : progress)

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
        return this.hover.isAnimating || this.isMoving || this.toggles.size > 0
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

    private getCurrent(entry: LegendEntry, progress: number): LegendEntry {
        const from = this.from.get(this.getKey(entry.value))

        return from
               ? { ...entry, x: lerp(from.x, entry.x, progress), y: lerp(from.y, entry.y, progress) }
               : entry
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
        const centerY = y + ITEM_HEIGHT / 2
        const textX = x + 22
        const isDisabled = value.disabled || value.isBlank
        const textColor = isDisabled ? withAlpha(Theme.text, .5) : Theme.text

        const background = this.buttonRect(items, this.units, { x, y, width, height: ITEM_HEIGHT }, 6, hover, () => this.toggle(value))

        items.arc()
             .position(this.units.x(x + 11), this.units.y(centerY))
             .radius(this.units.x(3))
             .fill()
             .color(isDisabled ? grayScale(value.color) : value.color)
             .layer(Layer.Legend + 2)
             .fixed()

        items.text(label)
             .position(this.units.x(textX), this.units.y(centerY))
             .size(FONT_SIZE)
             .align(TextAlignment.Left)
             .color(textColor)
             .layer(Layer.Legend + 2)
             .fixed()

        if (isDisabled)
            items.line()
                 .stop(this.units.x(textX), this.units.y(centerY + 1))
                 .stop(this.units.x(textX + stringWidth(label)), this.units.y(centerY + 1))
                 .color(textColor)
                 .layer(Layer.Legend + 2)
                 .fixed()

        return background.dispose()
    }

    private buildButton(items: QueueItemsBuilder, button: DOMRect, hover: number) {
        const background = this.buttonRect(items, this.units, button, 4, hover, () => this.reset())

        this.buttonText(items, this.units, button, TextResources.reset, FONT_SIZE)

        return background.dispose()
    }

    private calculateHorizontal(width: number, height: number) {
        const buttonSpace = this.buttonWidth > 0 ? this.buttonWidth + ITEM_GAP : 0
        const available = Math.max(width - (PADDING_X + buttonSpace) * 2, 0)
        const maxRows = Math.max(Math.floor((height / 4 - PADDING_Y * 2 + ROW_GAP) / (ITEM_HEIGHT + ROW_GAP)), 1)

        const rows: LegendEntry[][] = []
        let row: LegendEntry[] = []
        let rowWidth = 0

        for (const value of this.visibleValues()) {
            const label = Legend.truncate(Legend.getLabel(value), available - ITEM_EXTRA_WIDTH)
            const itemWidth = Math.min(stringWidth(label) + ITEM_EXTRA_WIDTH, available)

            if (row.length > 0 && rowWidth + ITEM_GAP + itemWidth > available) {
                rows.push(row)

                row = []
                rowWidth = 0
            }

            if (rows.length == maxRows)
                break

            rowWidth += (row.length > 0 ? ITEM_GAP : 0) + itemWidth

            row.push({ value, label, x: 0, y: 0, width: itemWidth })
        }

        if (row.length > 0 && rows.length < maxRows)
            rows.push(row)

        const rowsCount = Math.max(rows.length, 1)
        const areaHeight = PADDING_Y * 2 + rowsCount * ITEM_HEIGHT + (rowsCount - 1) * ROW_GAP
        const areaY = this.settings.legendPlace == LegendPlace.Top ? this.top : height - areaHeight

        this.area = new DOMRect(0, areaY, width, areaHeight)

        this.entries = []

        rows.forEach((items, index) => {
            const total = sum(items, item => item.width) + (items.length - 1) * ITEM_GAP

            let x = (width - total) / 2

            for (const item of items) {
                item.x = x
                item.y = areaY + PADDING_Y + index * (ITEM_HEIGHT + ROW_GAP)

                x += item.width + ITEM_GAP

                this.entries.push(item)
            }
        })
    }

    private calculateVertical(width: number, height: number) {
        const values = this.visibleValues()
        const widest = maxOf(values, value => stringWidth(Legend.getLabel(value))) + ITEM_EXTRA_WIDTH
        const areaWidth = Math.max(Math.min(Math.max(widest, this.buttonWidth) + PADDING_X * 2, width / 4), this.buttonWidth + PADDING_X * 2)
        const available = areaWidth - PADDING_X * 2
        const areaX = this.settings.legendPlace == LegendPlace.Left ? 0 : width - areaWidth

        this.area = new DOMRect(areaX, this.top, areaWidth, height - this.top)

        const buttonSpace = this.buttonWidth > 0 ? ITEM_HEIGHT + ROW_GAP : 0
        const availableHeight = height - this.top - PADDING_Y * 2 - buttonSpace
        const count = clamp(Math.floor((availableHeight + ROW_GAP) / (ITEM_HEIGHT + ROW_GAP)), 0, values.length)
        const blockHeight = count * ITEM_HEIGHT + Math.max(count - 1, 0) * ROW_GAP
        const startY = this.top + PADDING_Y + buttonSpace + Math.max((availableHeight - blockHeight) / 2, 0)

        this.entries = values.slice(0, count).map((value, index) => {
            const label = Legend.truncate(Legend.getLabel(value), available - ITEM_EXTRA_WIDTH)

            return {
                value,
                label,
                x: 0,
                y: startY + index * (ITEM_HEIGHT + ROW_GAP),
                width: Math.min(stringWidth(label) + ITEM_EXTRA_WIDTH, available)
            }
        })

        const blockWidth = maxOf(this.entries, entry => entry.width)

        for (const entry of this.entries)
            entry.x = areaX + (areaWidth - blockWidth) / 2
    }

    private visibleValues(): Value[] {
        const groups = groupBy(this.values.filter(value => !value.hideInLegend), value => this.getKey(value))

        return Array.from(groups.values(), group => group[0])
    }

    private getKey(value: Value) {
        return Legend.getGroupKey(value, this.isShared)
    }

    private toggle(value: Value) {
        this.isDirty = true

        const key = this.getKey(value)

        if (this.toggles.has(key) || !value.canToggle())
            return

        const disabled = value.disabled

        for (const item of this.values)
            if (this.getKey(item) == key && item.disabled == disabled)
                item.disabled = !disabled

        if (!this.settings.staticMode)
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
        const progress = this.getMoveProgress(now)

        const targets = this.entries.map((entry): [string, boolean] => {
            const { x, y, width } = this.getCurrent(entry, progress)

            return [entry.value.id, contains({ x, y, width, height: ITEM_HEIGHT }, mouse)]
        })

        if (this.button)
            targets.push([RESET_KEY, contains(this.button, mouse)])

        return this.hover.update(targets, now)
    }

    private updateBackgrounds() {
        for (const [key, item] of this.backgrounds)
            item.color = Theme.hoverBackground(this.hover.value(key))
    }

    private static getLabel(value: Value) {
        return value.isBlank ? `${ value.label } ${ TextResources.noValue }` : value.label
    }

    static truncate(label: string, maxWidth: number, font?: number) {
        if (stringWidth(label, font) <= maxWidth)
            return label

        const chars = Array.from(label)

        let low = 0
        let high = chars.length - 1

        while (low < high) {
            const middle = Math.ceil((low + high) / 2)

            if (stringWidth(chars.slice(0, middle).join('') + '…', font) <= maxWidth)
                low = middle
            else
                high = middle - 1
        }

        return chars.slice(0, low).join('') + '…'
    }
}

export default Legend