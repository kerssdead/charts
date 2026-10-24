import PlotData from '@/types/data/PlotData'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, PlotAxisType, PlotType, TextAlignment, TextBaseline, VerticalAlignment } from '@/static/Enums'
import { getRoundedValues } from '@/helpers/Numbers'
import { maxOf } from '@/helpers/Collections'
import { scientific, short, stringWidth } from '@/helpers/Text'
import Paddings from '@/types/Paddings'
import PlotSeries from '@/types/PlotSeries'
import Point from '@/types/Point'
import Theme from '@/Theme'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import PlotPoint from '@/types/PlotPoint'
import Formatter from '@/helpers/Formatter'
import ChartProcess from '@/render/ChartProcess'
import { clamp } from '@/helpers/Geometry'

const GAP = 30

const GAP_RATIO = 0.2

const LEFT_PADDING = 8

const LEFT_GAP = 8

const AXIS_TITLE_FONT = 14

const AXIS_LABEL_FONT = 14

const BOTTOM_PADDING = 6

const BOTTOM_GAP = 6

const X_LABEL_FONT = 12

const X_LABEL_SPACING = 8

const TOP_BASELINE_GAP = 4

const BAND_SPACING = 24

const BAR_BAND_RATIO = 0.35

const CORNER_RADIUS = 80

const SIMPLE_MARGIN = 50

const TOP_MARGIN = 200

const RIGHT_MARGIN = 100

const X_LABEL_HEIGHT = X_LABEL_FONT * 1.3

const Y_LABEL_HEIGHT = AXIS_LABEL_FONT * 1.3

const GRID_DASH = [1, 20]

const LINE_LAYER = Layer.Data + 1

const GHOST_TYPES = [PlotType.Column, PlotType.Bar, PlotType.StackingColumn]

const AXIS_LAYER = Layer.Data + 50

type Band = {
    top: number
    bottom: number
}

type ColumnGroup = {
    columns: PlotSeries[]
    hasStacking: boolean
}

type Slots = {
    values: (number | Date | string)[]
    index: Map<string, number>
}

export default class PlotProcess extends ChartProcess<PlotData> {
    private readonly series: PlotSeries[]

    private readonly margin: Paddings

    private readonly available: Point

    private readonly barBand: Band

    private readonly mainBand: Band

    private readonly barSeries: PlotSeries[]

    private readonly stacks = new Map<string, number>()

    private readonly stackTops: Map<string, PlotSeries> = new Map()

    private readonly columnGroups: Map<string, ColumnGroup> = new Map()

    private values: number[] = []

    private barValues: number[] = []

    private readonly mainSlots: Slots

    private readonly barSlots: Slots

    private readonly yMax: number | undefined

    private readonly indexes: Map<PlotSeries, number>

    private readonly scale: Point

    constructor(data: PlotData, pixel: Point, valuePostfix: string | undefined) {
        super(data, pixel, valuePostfix)

        this.series = data.values.filter(series => !series.disabled)
        this.yMax = this.data.yMax == 0 ? undefined : this.data.yMax
        this.indexes = new Map(data.values.map((series, index) => [series, index]))
        this.barSeries = data.values.filter(s => s.type == PlotType.Bar)

        for (const series of this.series.filter(s => s.type == PlotType.StackingColumn))
            for (const value of series.values)
                if (Number(value.y) != 0)
                    this.stackTops.set(PlotProcess.getStackKey(value), series)

        for (const series of this.series.filter(s => s.type == PlotType.Column || s.type == PlotType.StackingColumn)) {
            for (const value of series.values) {
                const key = value.x.toString()
                const group = this.columnGroups.get(key) ?? { columns: [], hasStacking: false }

                if (series.type == PlotType.Column)
                    group.columns.push(series)
                else
                    group.hasStacking = true

                this.columnGroups.set(key, group)
            }
        }

        this.mainSlots = this.getSlots(data.values.filter(s => s.type != PlotType.Bar && s.type != PlotType.AttentionLine))
        this.barSlots = this.getSlots(this.barSeries)

        this.calculateLabels()

        this.margin = this.data.simple
                      ? { top: SIMPLE_MARGIN, right: SIMPLE_MARGIN, bottom: SIMPLE_MARGIN, left: SIMPLE_MARGIN }
                      : { top: TOP_MARGIN, right: RIGHT_MARGIN, bottom: this.getBottomMargin(), left: this.getLeftMargin() }

        this.available = {
            x: COORDS_MAX_X - this.margin.left - this.margin.right,
            y: COORDS_MAX_Y - this.margin.top - this.margin.bottom
        }

        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom
        const barBottom = this.isMixed ? top + (bottom - top - this.bandGap) * BAR_BAND_RATIO : bottom

        this.barBand = { top, bottom: barBottom }
        this.mainBand = { top: this.isMixed ? barBottom + this.bandGap : top, bottom }

        this.scale = {
            x: PlotProcess.getScale(this.barValues, this.available.x),
            y: PlotProcess.getScale(this.values, this.mainBand.bottom - this.mainBand.top)
        }
    }

    get isHorizontal() {
        return this.data.values.length > 0
               && this.barSeries.length == this.data.values.length
    }

    getAxisY(value: number) {
        const { top, bottom } = this.mainBand
        const range = PlotProcess.axisRange(this.values)

        return !range || range.max == range.min
               ? bottom
               : bottom - (value - range.min) / (range.max - range.min) * (bottom - top)
    }

    getAxisX(value: number) {
        const range = PlotProcess.axisRange(this.barValues)

        return !range || range.max == range.min
               ? this.margin.left
               : this.margin.left + (value - range.min) / (range.max - range.min) * this.available.x
    }

    getAxisValue(y: number) {
        const { top, bottom } = this.mainBand
        const range = PlotProcess.axisRange(this.values)

        if (!range || bottom == top)
            return 0

        return range.min + (bottom - y) / (bottom - top) * (range.max - range.min)
    }

    isEmpty() {
        return !this.series.some(series => series.values.length)
    }

    getData() {
        this.stacks.clear()

        const series = this.data.values.flatMap(series => {
            if (series.disabled && !GHOST_TYPES.includes(series.type))
                return []

            return [this.getSeries(series)]
        })

        return [this.getTitles(), this.getBase(), ...series]
    }

    private get hasBars() {
        return this.barSeries.length > 0
    }

    private get isMixed() {
        return this.hasBars && !this.isHorizontal
    }

    private get leftTitle() {
        return this.isHorizontal ? this.data.xTitle : this.data.yTitle
    }

    private get bottomTitle() {
        return this.isHorizontal ? this.data.yTitle : this.data.xTitle
    }

    private get bandGap() {
        return this.units.y(X_LABEL_HEIGHT + BAND_SPACING)
    }

    private getLeftMargin() {
        const titleWidth = this.leftTitle ? AXIS_TITLE_FONT + LEFT_GAP : 0

        const labels = [
            ...(this.hasBars ? this.getCategories() : []),
            ...(this.isHorizontal ? [] : this.values.map(value => short(value, this.data.shortLabels)))
        ]

        const labelsWidth = maxOf(labels, label => stringWidth(label, AXIS_LABEL_FONT))

        return this.units.x(LEFT_PADDING + titleWidth + labelsWidth + LEFT_GAP)
    }

    private getBottomMargin() {
        const titleHeight = this.bottomTitle ? BOTTOM_GAP + AXIS_TITLE_FONT : 0

        return this.units.y(X_LABEL_HEIGHT + titleHeight + BOTTOM_PADDING)
    }

    private static axisRange(values: number[]) {
        return values.length < 2 ? null : { min: values[0], max: values[values.length - 1] }
    }

    private static getScale(values: number[], size: number) {
        const range = PlotProcess.axisRange(values)

        return !range || range.max == range.min ? 0 : size / (range.max - range.min)
    }

    private getCategories() {
        return this.barSlots.values.map(x => this.formatX(x))
    }

    private getSlots(series: PlotSeries[]): Slots {
        const unique = new Map<string, number | Date | string>()

        for (const s of series)
            for (const value of s.values)
                if (!unique.has(value.x.toString()))
                    unique.set(value.x.toString(), value.x)

        const values = Array.from(unique.values())

        const order = (x: number | Date | string) => this.data.xType == PlotAxisType.Date ? Formatter.toDate(x).getTime() : Number(x)

        if (this.data.xType != PlotAxisType.Text && values.every(x => !isNaN(order(x))))
            values.sort((a, b) => order(a) - order(b))

        return { values, index: new Map(values.map((x, i) => [x.toString(), i])) }
    }

    private static getSlot(slots: Slots, value: PlotPoint) {
        return slots.index.get(value.x.toString()) ?? 0
    }

    private formatX(x: number | Date | string) {
        return Formatter.axis(x, this.data.xType)
    }

    private slotX(i: number, step: number) {
        return this.margin.left + i * step + (i + 1) * this.mainGap
    }

    private static getGap(available: number, count: number) {
        return Math.min(GAP, available / Math.max(count, 1) * GAP_RATIO)
    }

    private get mainGap() {
        return PlotProcess.getGap(this.available.x, this.mainSlots.values.length)
    }

    private get barGap() {
        return PlotProcess.getGap(this.barBand.bottom - this.barBand.top, this.barSlots.values.length)
    }

    private getMainStep() {
        return (this.available.x - this.mainGap) / this.mainSlots.values.length - this.mainGap
    }

    private getBarStep() {
        const { top, bottom } = this.barBand

        return (bottom - top - this.barGap) / this.barSlots.values.length - this.barGap
    }

    private cap(y: number) {
        return this.yMax == undefined ? y : Math.min(y, this.yMax)
    }

    private getBase() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            this.getBaseLabels(items)
            this.getBaseLines(items)
        }
    }

    private getBaseLabels(items: QueueItemsBuilder) {
        if (this.hasBars) {
            const { bottom } = this.barBand
            const step = this.getBarStep()

            this.getBarLabels().forEach((label, i) => {
                const value = this.barValues[i]

                if (label)
                    this.bottomLabel(items, label, this.getAxisX(value), bottom, `x-label-${ value }`)
            })

            const every = Math.max(1, Math.ceil(Y_LABEL_HEIGHT / this.units.toPxY(step + this.barGap)))

            this.getCategories().forEach((category, i) => {
                if (i % every == 0)
                    this.leftLabel(items, category, bottom - i * (step + this.barGap) - this.barGap - step / 2, `y-category-${ i }`)
            })
        }

        if (this.isHorizontal)
            return

        for (const value of this.values)
            this.leftLabel(items, short(value, this.data.shortLabels), this.getAxisY(value), `y-label-${ value }`)
                .axisValue(value)

        const step = this.getMainStep()
        const labels = this.mainSlots.values.map(x => this.formatX(x))

        const positions = labels.map((_, i) => this.slotX(i, step) + step / 2)

        const slot = this.units.toPxX(step + this.mainGap)
        const widest = maxOf(labels, label => stringWidth(label, X_LABEL_FONT))
        const every = this.getLabelStep(labels, positions, Math.ceil((widest + X_LABEL_SPACING) / slot))

        labels.forEach((label, i) => {
            if (i % every == 0)
                this.bottomLabel(items, label, positions[i], this.mainBand.bottom, `x-category-${ i }`)
        })
    }

    private getBarLabels() {
        const positions = this.barValues.map(value => this.getAxisX(value))

        const variants = [this.data.shortLabels, true]
            .map(isShort => this.barValues.map(value => short(value, isShort)))
            .concat([this.barValues.map(scientific)])

        const labels = variants.find(labels => !this.isOverlapping(labels, positions, 1)) ?? variants[variants.length - 1]
        const every = this.getLabelStep(labels, positions, 1)

        return labels.map((label, i) => i % every == 0 ? label : '')
    }

    private getLabelStep(labels: string[], positions: number[], from: number) {
        let every = Math.max(1, from)

        while (every < labels.length && this.isOverlapping(labels, positions, every))
            every++

        return every
    }

    private isOverlapping(labels: string[], positions: number[], every: number) {
        let right = -Infinity

        return labels.some((label, i) => {
            if (i % every != 0)
                return false

            const half = this.units.x(stringWidth(label, X_LABEL_FONT) / 2)
            const x = this.clampLabel(label, positions[i])
            const isOverlap = x - half < right

            right = x + half + this.units.x(X_LABEL_SPACING)

            return isOverlap
        })
    }

    private clampLabel(text: string, x: number) {
        const half = this.units.x(stringWidth(text, X_LABEL_FONT) / 2)

        return clamp(x, this.margin.left + half, COORDS_MAX_X - half)
    }

    private leftLabel(items: QueueItemsBuilder, text: string, y: number, key: string) {
        return items.text(text)
                    .position(this.margin.left - this.units.x(LEFT_GAP), y)
                    .size(AXIS_LABEL_FONT)
                    .align(TextAlignment.Right)
                    .key(key)
    }

    private bottomLabel(items: QueueItemsBuilder, text: string, x: number, y: number, key: string) {
        return items.text(text)
                    .position(this.clampLabel(text, x), y + this.units.y(TOP_BASELINE_GAP))
                    .align(TextAlignment.Center)
                    .baseline(TextBaseline.Top)
                    .size(X_LABEL_FONT)
                    .key(key)
    }

    private getBaseLines(items: QueueItemsBuilder) {
        if (this.hasBars) {
            const { top, bottom } = this.barBand

            this.getAxisLines(items, this.barValues, 'x', value => {
                const x = this.getAxisX(value)

                return [{ x, y: top }, { x, y: bottom }]
            })
        }

        if (this.isHorizontal)
            return

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        this.getAxisLines(items, this.values, 'y', value => {
            const y = this.getAxisY(value)

            return [{ x: x1, y }, { x: x2, y }]
        })
    }

    private getAxisLines(items: QueueItemsBuilder, values: number[], axis: 'x' | 'y', getLine: (value: number) => [Point, Point]) {
        const [from, to] = getLine(values[0] ?? 0)

        items.line()
             .stop(from.x, from.y)
             .stop(to.x, to.y)
             .stroke(Theme.line)
             .layer(AXIS_LAYER)
             .key(`axis-${ axis }`)

        for (const value of values.slice(1)) {
            const [from, to] = getLine(value)

            const grid = items.line()
                              .stop(from.x, from.y)
                              .stop(to.x, to.y)
                              .dash(GRID_DASH)
                              .stroke(Theme.lineAxis)
                              .layer(Layer.Base)
                              .key(`grid-${ axis }-${ value }`)

            if (axis == 'y')
                grid.axisValue(value)
        }
    }

    private calculateLabels() {
        const stacks: Map<string, number> = new Map()
        const values: number[] = []
        const barValues: number[] = []

        for (const series of this.series) {
            for (const value of series.values) {
                const y = Number(value.y)

                if (series.type == PlotType.Bar) {
                    barValues.push(y)
                } else if (series.type == PlotType.StackingColumn) {
                    const key = PlotProcess.getStackKey(value)

                    stacks.set(key, (stacks.get(key) ?? 0) + y)
                } else {
                    values.push(y)
                }
            }
        }

        this.values = getRoundedValues([...stacks.values(), ...values], 5, this.yMax)
        this.barValues = getRoundedValues(barValues, 5, this.isHorizontal ? this.yMax : undefined)
    }

    private getTitles() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            if (this.leftTitle) {
                items.text(this.leftTitle)
                     .position(this.units.x(LEFT_PADDING + TOP_BASELINE_GAP), COORDS_MAX_Y / 2)
                     .baseline(TextBaseline.Top)
                     .size(AXIS_TITLE_FONT)
                     .rotate(Math.PI * 1.5)
                     .key('axis-title-x')
            }

            if (this.bottomTitle) {
                items.text(this.bottomTitle)
                     .position(COORDS_MAX_X / 2, COORDS_MAX_Y - this.units.y(BOTTOM_PADDING + AXIS_TITLE_FONT / 2))
                     .size(AXIS_TITLE_FONT)
                     .key('axis-title-y')
            }
        }
    }

    private get initStagger() {
        const slots = Math.max(this.mainSlots.values.length, this.barSlots.values.length, 1)

        return Math.min(AnimationTiming.plotInitStagger, AnimationTiming.plotInitStaggerTotal / slots)
    }

    private groupHover(item: QueueItemBaseBuilder, series: PlotSeries) {
        if (this.series.length > 1)
            item.hoverGroup(this.getKey(series))
    }

    private indexOf(series: PlotSeries) {
        return this.indexes.get(series) ?? -1
    }

    private getKey(series: PlotSeries, ...parts: (string | number)[]) {
        return [this.indexOf(series), ...parts].join('-')
    }

    private getSeries(series: PlotSeries): QueueAction {
        switch (series.type) {
            case PlotType.Column:
                return this.getColumns(series)

            case PlotType.Line:
                return this.getLines(series)

            case PlotType.Bar:
                return this.getBars(series)

            case PlotType.StackingColumn:
                return this.getStackedColumns(series)

            case PlotType.AttentionLine:
                return this.getAttentionLine(series)

            default:
                return QueueItemsBuilder.empty
        }
    }

    private getColumns(series: PlotSeries) {
        const baseY = this.getAxisY(0)

        const step = this.getMainStep()
        const index = this.indexOf(series)

        return (items: QueueItemsBuilder) => {
            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.mainSlots, value)

                const { columns, slots } = this.getColumnGroup(value)
                const visibleBefore = columns.filter(s => this.indexOf(s) < index).length
                const widthInStep = step / slots
                const width = series.disabled ? 0 : widthInStep
                const offset = visibleBefore * widthInStep

                const column = items.rect()
                     .position(this.slotX(i, step) + offset + width / 2, baseY)
                     .size(width, series.disabled ? 0 : this.cap(Number(value.y)) * this.scale.y)
                     .round([CORNER_RADIUS, CORNER_RADIUS, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i)
            })
        }
    }

    private dataRect(rect: QueueRectangleItemBuilder, series: PlotSeries, value: PlotPoint, index: number) {
        const item = rect.fill()
                         .gradient()
                         .color(series.color)
                         .layer(Layer.Data)
                         .key(this.getKey(series, 'rect', index))
                         .interact()
                         .init(AnimationTiming.plotInit, index * this.initStagger)
                         .tooltip(this.getValueTooltip(series, value))
                         .data(value.data)
                         .contextMenu()

        this.groupHover(item, series)

        if (series.disabled)
            item.ghost()

        return item
    }

    private getLines(series: PlotSeries) {
        const baseY = this.getAxisY(0)

        const step = this.getMainStep()

        return (items: QueueItemsBuilder) => {
            const line = items.line()

            const slots = series.values.map(value => ({ value, i: PlotProcess.getSlot(this.mainSlots, value) }))
                                .sort((a, b) => a.i - b.i)

            slots.forEach(({ value, i }) => {
                line.stop(
                    this.slotX(i, step) + step / 2,
                    baseY - this.cap(Number(value.y)) * this.scale.y,
                    this.getValueTooltip(series, value)
                )
            })

            line.dash(Array.isArray(series.dash) ? series.dash : [])
                .gradient()

            this.dataLine(line, series, 'line')
        }
    }

    private dataLine(line: QueueLineItemBuilder, series: PlotSeries, suffix: string) {
        line.width(series.width)
            .color(series.color)
            .layer(LINE_LAYER)
            .key(this.getKey(series, suffix))
            .interact()
            .init(AnimationTiming.plotLineInit)

        this.groupHover(line, series)
    }

    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const step = this.getBarStep()

            const visibleBefore = this.barSeries.slice(0, this.barSeries.indexOf(series)).filter(s => !s.disabled).length
            const heightInStep = step / Math.max(this.barSeries.filter(s => !s.disabled).length, 1)
            const height = series.disabled ? 0 : heightInStep

            const baseY = this.barBand.bottom - visibleBefore * heightInStep

            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.barSlots, value)
                const x = this.getAxisX(0)
                const y = baseY - i * (step + this.barGap) - this.barGap

                const bar = items.rect()
                     .position(x, y)
                     .size(series.disabled ? 0 : (this.isHorizontal ? this.cap(Number(value.y)) : Number(value.y)) * this.scale.x, height)
                     .round([0, CORNER_RADIUS, CORNER_RADIUS, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', x)

                this.dataRect(bar, series, value, i)
            })
        }
    }

    private getStackedColumns(series: PlotSeries) {
        const baseY = this.getAxisY(0)

        const step = this.getMainStep()

        const stacked = series.values.map(value => {
            const i = PlotProcess.getSlot(this.mainSlots, value)

            const { columns, slots } = this.getColumnGroup(value)
            const width = step / slots
            const offset = columns.length * width

            const key = PlotProcess.getStackKey(value)
            const stack = this.stacks.get(key) ?? 0
            const room = this.yMax == undefined ? Infinity : Math.max(this.yMax * this.scale.y + stack, 0)
            const height = series.disabled ? 0 : Math.min(Number(value.y) * this.scale.y, room)

            this.stacks.set(key, stack - height)

            return {
                value,
                i,
                x: this.slotX(i, step) + offset,
                y: baseY + stack,
                width,
                height,
                isTop: this.stackTops.get(key) === series
            }
        })

        return (items: QueueItemsBuilder) => {
            for (const { value, i, x, y, width, height, isTop } of stacked) {
                const column = items.rect()
                     .position(x, y)
                     .size(width, height)
                     .collapse(false, true)
                     .round(isTop ? [CORNER_RADIUS, CORNER_RADIUS, 0, 0] : [0, 0, 0, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i)
                    .fade(false)
            }
        }
    }

    private getValueTooltip(series: PlotSeries, value: PlotPoint) {
        return this.tooltip(series.label, value.label ?? this.formatX(value.x), this.formatValue(value.y))
    }

    private static getStackKey(value: PlotPoint) {
        return `${ value.x.toString() }${ Number(value.y) < 0 ? '-' : '+' }`
    }

    private getColumnGroup(value: PlotPoint) {
        const group = this.columnGroups.get(value.x.toString()) ?? { columns: [], hasStacking: false }

        return { columns: group.columns, slots: Math.max(group.columns.length + (group.hasStacking ? 1 : 0), 1) }
    }

    private getAttentionLine(series: PlotSeries) {
        if (series.values.length == 0)
            return QueueItemsBuilder.empty

        const y = this.getAxisY(0)
                  - this.cap(Number(series.values[0].y)) * this.scale.y

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        return (items: QueueItemsBuilder) => {
            this.dataLine(items.line().stop(x1, y).stop(x2, y), series, 'attention')
        }
    }
}