import PlotData from '@/types/data/PlotData'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, PlotAxisType, PlotType, TextAlignment, TextBaseline, VerticalAlignment } from '@/static/Enums'
import { getRoundedValues, maxOf, short, stringWidth } from '@/Helper'
import Paddings from '@/types/Paddings'
import PlotSeries from '@/types/PlotSeries'
import Point from '@/types/Point'
import Theme from '@/Theme'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import PlotPoint from '@/types/PlotPoint'
import Formatter from '@/helpers/Formatter'
import Units from '@/helpers/Units'

const GAP = 30

const LEFT_PADDING = 8

const LEFT_GAP = 8

const AXIS_TITLE_FONT = 14

const AXIS_LABEL_FONT = 14

const BOTTOM_PADDING = 6

const BOTTOM_GAP = 6

const X_LABEL_FONT = 12

const X_LABEL_SPACING = 8

const BAND_SPACING = 24

const BAR_BAND_RATIO = 0.35

const CORNER_RADIUS = 80

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

export default class PlotProcess {
    private data: PlotData

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

    private readonly units: Units

    private readonly yMax: number | undefined

    private readonly valuePostfix: string | undefined

    private readonly indexes: Map<PlotSeries, number>

    private scale: Point = { x: 0, y: 0 }

    private getScale(): Point {
        const { top, bottom } = this.mainBand

        return {
            x: this.available.x / PlotProcess.range(this.barValues),
            y: (bottom - top) / PlotProcess.range(this.values)
        }
    }

    private static range(values: number[]) {
        return Math.abs(Math.max(...values)) + Math.abs(Math.min(...values))
    }

    private get hasBars() {
        return this.barSeries.length > 0
    }

    private get isMixed() {
        return this.hasBars && !this.isHorizontal
    }

    private get bandGap() {
        return this.units.y(X_LABEL_FONT * 1.3 + BAND_SPACING)
    }

    constructor(data: PlotData, pixel: Point, valuePostfix: string | undefined) {
        this.data = data
        this.valuePostfix = valuePostfix
        this.series = data.values.filter(series => !series.disabled)
        this.yMax = this.data.yMax == 0 ? undefined : this.data.yMax
        this.units = new Units(pixel)
        this.indexes = new Map(data.values.map((series, index) => [series, index]))
        this.barSeries = data.values.filter(s => s.type == PlotType.Bar)

        for (const series of this.series.filter(s => s.type == PlotType.StackingColumn))
            for (const value of series.values)
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

        this.mainSlots = this.getSlots(data.values.filter(s => s.type != PlotType.Bar))
        this.barSlots = this.getSlots(this.barSeries)

        this.calculateLabels()

        this.margin = this.data.simple
                      ? { top: 50, right: 50, bottom: 50, left: 50 }
                      : { top: 200, right: 100, bottom: this.getBottomMargin(), left: this.getLeftMargin() }

        this.available = {
            x: COORDS_MAX_X - this.margin.left - this.margin.right,
            y: COORDS_MAX_Y - this.margin.top - this.margin.bottom
        }

        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom
        const barBottom = this.isMixed ? top + (bottom - top - this.bandGap) * BAR_BAND_RATIO : bottom

        this.barBand = { top, bottom: barBottom }
        this.mainBand = { top: this.isMixed ? barBottom + this.bandGap : top, bottom }

        this.scale = this.getScale()
    }

    private getLeftMargin() {
        const titleWidth = this.data.xTitle ? AXIS_TITLE_FONT + LEFT_GAP : 0

        const labels = [
            ...(this.hasBars ? this.getCategories() : []),
            ...(this.isHorizontal ? [] : this.values.map(value => short(value, this.data.shortLabels)))
        ]

        const labelsWidth = maxOf(labels, label => stringWidth(label, AXIS_LABEL_FONT))

        return this.units.x(LEFT_PADDING + titleWidth + labelsWidth + LEFT_GAP)
    }

    private getBottomMargin() {
        const labelsHeight = X_LABEL_FONT * 1.3
        const titleHeight = this.data.yTitle ? BOTTOM_GAP + AXIS_TITLE_FONT : 0

        return this.units.y(labelsHeight + titleHeight + BOTTOM_PADDING)
    }

    private static axisRange(values: number[]) {
        return values.length < 2 ? null : { min: values[0], max: values[values.length - 1] }
    }

    getAxisY(value: number) {
        const { top, bottom } = this.mainBand
        const range = PlotProcess.axisRange(this.values)

        return !range || range.max == range.min
               ? bottom
               : bottom - (value - range.min) / (range.max - range.min) * (bottom - top)
    }

    get isHorizontal() {
        return this.data.values.length > 0
               && this.barSeries.length == this.data.values.length
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

    private slotX(i: number, step: number) {
        return this.margin.left + i * step + (i + 1) * GAP
    }

    private getMainStep() {
        return (this.available.x - GAP) / this.mainSlots.values.length - GAP
    }

    private getBarStep() {
        const { top, bottom } = this.barBand

        return (bottom - top - GAP) / this.barSlots.values.length - GAP
    }

    getBase() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            this.getBaseLabels(items)
            this.getBaseLines(items)
        }
    }

    private getBaseLabels(items: QueueItemsBuilder) {
        const x1 = this.margin.left - this.units.x(LEFT_GAP)

        if (this.hasBars)
            this.getHorizontalLabels(items, x1)

        if (this.isHorizontal)
            return

        // Left labels
        for (const label of this.values) {
            items.text(short(label, this.data.shortLabels))
                 .position(x1, this.getAxisY(label))
                 .size(AXIS_LABEL_FONT)
                 .align(TextAlignment.Right)
                 .key(`y-label-${ label }`)
                 .axisValue(label)
        }

        if (this.mainSlots.values.length > 0) {
            // Bottom labels
            const stepX = this.getMainStep()

            const y = COORDS_MAX_Y - this.margin.bottom

            const labels = this.mainSlots.values.map(x => this.formatX(x))

            const slot = this.units.toPxX(stepX + GAP)
            const widest = maxOf(labels, label => stringWidth(label, X_LABEL_FONT))
            const every = Math.max(1, Math.ceil((widest + X_LABEL_SPACING) / slot))

            labels.forEach((label, i) => {
                if (i % every != 0)
                    return

                items.text(label)
                     .position(this.slotX(i, stepX) + stepX / 2, y)
                     .align(TextAlignment.Center)
                     .baseline(TextBaseline.Top)
                     .size(X_LABEL_FONT)
                     .key(`x-category-${ i }`)
            })
        }
    }

    private getHorizontalLabels(items: QueueItemsBuilder, x1: number) {
        const { bottom } = this.barBand

        // Bottom labels
        for (const label of this.barValues) {
            items.text(short(label, this.data.shortLabels))
                 .position(this.getAxisX(label), bottom)
                 .align(TextAlignment.Center)
                 .baseline(TextBaseline.Top)
                 .size(X_LABEL_FONT)
                 .key(`x-label-${ label }`)
        }

        // Left labels
        const categories = this.getCategories()

        if (categories.length == 0)
            return

        const step = this.getBarStep()

        categories.forEach((category, i) => {
            const groupBottom = bottom - i * (step + GAP) - GAP

            items.text(category)
                 .position(x1, groupBottom - step / 2)
                 .size(AXIS_LABEL_FONT)
                 .align(TextAlignment.Right)
                 .key(`y-category-${ i }`)
        })
    }

    private axisLine(items: QueueItemsBuilder, from: Point, to: Point, key: string) {
        return items.line()
                    .stop(from.x, from.y)
                    .stop(to.x, to.y)
                    .stroke(Theme.line)
                    .layer(Layer.Data + 50)
                    .key(key)
    }

    private gridLine(items: QueueItemsBuilder, from: Point, to: Point, key: string) {
        return items.line()
                    .stop(from.x, from.y)
                    .stop(to.x, to.y)
                    .dash([1, 20])
                    .stroke(Theme.lineAxis)
                    .layer(Layer.Base)
                    .key(key)
    }

    private getHorizontalLines(items: QueueItemsBuilder) {
        const { top, bottom } = this.barBand
        const axisX = this.getAxisX(this.barValues[0] ?? 0)

        this.axisLine(items, { x: axisX, y: top }, { x: axisX, y: bottom }, 'axis-y')

        for (const value of this.barValues.slice(1)) {
            const x = this.getAxisX(value)

            this.gridLine(items, { x, y: top }, { x, y: bottom }, `grid-x-${ value }`)
        }
    }

    private getBaseLines(items: QueueItemsBuilder) {
        if (this.hasBars)
            this.getHorizontalLines(items)

        if (this.isHorizontal)
            return

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const axisY = COORDS_MAX_Y - this.margin.bottom

        // Horizontal lines
        this.axisLine(items, { x: x1, y: axisY }, { x: x2, y: axisY }, 'axis-x')

        for (const value of this.values.slice(1)) {
            const y = this.getAxisY(value)

            this.gridLine(items, { x: x1, y }, { x: x2, y }, `grid-${ value }`)
                .axisValue(value)
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

    getTitles() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            if (this.data.xTitle) {
                items.text(this.data.xTitle)
                     .position(this.units.x(LEFT_PADDING), COORDS_MAX_Y / 2)
                     .baseline(TextBaseline.Top)
                     .size(AXIS_TITLE_FONT)
                     .rotate(270)
                     .key('axis-title-x')
            }

            if (this.data.yTitle) {
                items.text(this.data.yTitle)
                     .position(COORDS_MAX_X / 2 - this.units.x(AXIS_TITLE_FONT / 2), COORDS_MAX_Y - this.units.y(BOTTOM_PADDING + AXIS_TITLE_FONT / 2))
                     .size(AXIS_TITLE_FONT)
                     .key('axis-title-y')
            }
        }
    }

    private static readonly ghostTypes = [PlotType.Column, PlotType.Bar, PlotType.StackingColumn]

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

    getData() {
        return this.data.values.flatMap(series => {
            if (series.disabled && !PlotProcess.ghostTypes.includes(series.type))
                return []

            return [this.getSeries(series)]
        })
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
        const color = series.color

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
                     .size(width, series.disabled ? 0 : Number(value.y) * this.scale.y)
                     .round([CORNER_RADIUS, CORNER_RADIUS, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i, color, this.getValueTooltip(series, value))
            })
        }
    }

    private dataRect(rect: QueueRectangleItemBuilder,
                     series: PlotSeries,
                     value: PlotPoint,
                     index: number,
                     color: string,
                     tooltip?: string) {
        const item = rect.fill()
                         .gradient()
                         .color(color)
                         .layer(Layer.Data)
                         .key(this.getKey(series, 'rect', index))
                         .interact()
                         .init(AnimationTiming.plotInit, index * AnimationTiming.plotInitStagger)
                         .data(value.data)
                         .contextMenu()

        if (tooltip)
            item.tooltip(tooltip)

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
                    baseY - Number(value.y) * this.scale.y
                )
            })

            line.width(series.width)
                .dash(Array.isArray(series.dash) ? series.dash : [])
                .color(series.color)
                .layer(Layer.Data + 1)
                .key(this.getKey(series, 'line'))
                .interact()
                .init(AnimationTiming.plotLineInit)

            this.groupHover(line, series)
        }
    }

    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const step = this.getBarStep()

            const visibleBefore = this.barSeries.slice(0, this.barSeries.indexOf(series)).filter(s => !s.disabled).length
            const heightInStep = step / Math.max(this.barSeries.filter(s => !s.disabled).length, 1)
            const height = series.disabled ? 0 : heightInStep

            const baseY = this.barBand.bottom - visibleBefore * heightInStep
            const color = series.color

            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.barSlots, value)
                const x = this.getAxisX(0)
                const y = baseY - i * (step + GAP) - GAP

                const bar = items.rect()
                     .position(x, y)
                     .size(series.disabled ? 0 : Number(value.y) * this.scale.x, height)
                     .round([0, CORNER_RADIUS, CORNER_RADIUS, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', x)

                this.dataRect(bar, series, value, i, color, this.getValueTooltip(series, value))
            })
        }
    }

    private getStackedColumns(series: PlotSeries) {
        const baseY = this.getAxisY(0)
        const color = series.color

        const step = this.getMainStep()

        const stacked = series.values.map(value => {
            const i = PlotProcess.getSlot(this.mainSlots, value)

            const { columns, slots } = this.getColumnGroup(value)
            const width = step / slots
            const offset = columns.length * width

            const key = PlotProcess.getStackKey(value)
            const stack = this.stacks.get(key) ?? 0
            const height = series.disabled ? 0 : Number(value.y) * this.scale.y

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

                this.dataRect(column, series, value, i, color, this.getValueTooltip(series, value))
                    .fade(false)
            }
        }
    }

    private getValueTooltip(series: PlotSeries, value: PlotPoint) {
        const rows = [series.label, value.label ?? this.formatX(value.x), Formatter.value(value.y, this.valuePostfix)]

        return rows.filter(row => row).join('\n')
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
                  - Number(series.values[0].y) * this.scale.y

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const color = series.color

        return (items: QueueItemsBuilder) => {
            const line = items.line()
                              .stop(x1, y)
                              .stop(x2, y)
                              .width(series.width)
                              .color(color)
                              .layer(Layer.Data + 1)
                              .key(this.getKey(series, 'attention'))
                              .interact()
                              .init(AnimationTiming.plotLineInit)

            this.groupHover(line, series)
        }
    }
}