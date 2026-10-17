import PlotData from 'types/data/PlotData'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import { Animations, COORDS_MAX_X, COORDS_MAX_Y, Layer } from 'static/constants/Index'
import { HorizontalAlignment, PlotAxisType, PlotType, TextAlignment, TextBaseline, VerticalAlignment } from 'static/Enums'
import { getRoundedValues, short, stringWidth } from 'Helper'
import Margin from 'types/Margin'
import PlotSeries from 'types/PlotSeries'
import Debug from 'Debug'
import Point from 'types/Point'
import Theme from 'Theme'
import QueueRectangleItemBuilder from 'builders/QueueRectangleItemBuilder'
import QueueItemBaseBuilder from 'builders/QueueItemBaseBuilder'
import PlotPoint from 'types/PlotPoint'
import Formatter from 'helpers/Formatter'
import ChartSettings from 'types/ChartSettings'

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

    private margin: Margin

    private stacks: Map<string, number>

    private readonly stackTops: Map<string, PlotSeries> = new Map()

    private readonly columnGroups: Map<string, ColumnGroup> = new Map()

    private values: number[] = []

    private barValues: number[] = []

    private readonly mainSlots: Slots

    private readonly barSlots: Slots

    private readonly pixel: Point

    private readonly yMax: number | undefined

    private readonly valuePostfix: string | undefined

    private get available() {
        return {
            x: COORDS_MAX_X - this.margin.left - this.margin.right,
            y: COORDS_MAX_Y - this.margin.top - this.margin.bottom
        }
    }

    private get scale() {
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
        return this.data.values.some(series => series.type == PlotType.Bar)
    }

    private get isMixed() {
        return this.hasBars && !this.isHorizontal
    }

    private get bandGap() {
        return (X_LABEL_FONT * 1.3 + BAND_SPACING) * this.pixel.y
    }

    private get barBand(): Band {
        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom

        if (!this.isMixed)
            return { top, bottom }

        return { top, bottom: top + (bottom - top - this.bandGap) * BAR_BAND_RATIO }
    }

    private get mainBand(): Band {
        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom

        if (!this.isMixed)
            return { top, bottom }

        return { top: this.barBand.bottom + this.bandGap, bottom }
    }

    constructor(data: PlotData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.valuePostfix = settings.valuePostfix
        this.series = data.values.filter(series => !series.disabled)
        this.yMax = this.data.yMax == 0 ? undefined : this.data.yMax
        this.pixel = pixel

        this.stacks = new Map<string, number>()

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
        this.barSlots = this.getSlots(data.values.filter(s => s.type == PlotType.Bar))

        this.calculateLabels()

        this.margin = {
            top: 200,
            right: 100,
            bottom: this.getBottomMargin(),
            left: this.getLeftMargin()
        }

        if (this.data.simple) {
            this.margin = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            }
        }
    }

    private getLeftMargin() {
        const titleWidth = this.data.xTitle ? AXIS_TITLE_FONT + LEFT_GAP : 0

        const labels = [
            ...(this.hasBars ? this.getCategories() : []),
            ...(this.isHorizontal ? [] : this.values.map(value => short(value, this.data.shortLabels)))
        ]

        const labelsWidth = Math.max(0, ...labels.map(label => {
            return stringWidth(label, AXIS_LABEL_FONT)
        }))

        return (LEFT_PADDING + titleWidth + labelsWidth + LEFT_GAP) * this.pixel.x
    }

    private getBottomMargin() {
        const labelsHeight = X_LABEL_FONT * 1.3
        const titleHeight = this.data.yTitle ? BOTTOM_GAP + AXIS_TITLE_FONT : 0

        return (labelsHeight + titleHeight + BOTTOM_PADDING) * this.pixel.y
    }

    getAxisY(value: number) {
        const { top, bottom } = this.mainBand

        if (this.values.length < 2)
            return bottom

        const min = this.values[0]
        const max = this.values[this.values.length - 1]

        return max == min
               ? bottom
               : bottom - (value - min) / (max - min) * (bottom - top)
    }

    get isHorizontal() {
        return this.data.values.length > 0
               && this.data.values.every(series => series.type == PlotType.Bar)
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

        const order = (x: number | Date | string) => this.data.xType == PlotAxisType.Date ? new Date(x).getTime() : Number(x)

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
        if (this.barValues.length < 2)
            return this.margin.left

        const min = this.barValues[0]
        const max = this.barValues[this.barValues.length - 1]

        return max == min
               ? this.margin.left
               : this.margin.left + (value - min) / (max - min) * this.available.x
    }

    getAxisValue(y: number) {
        const { top, bottom } = this.mainBand

        if (this.values.length < 2 || bottom == top)
            return 0

        const min = this.values[0]
        const max = this.values[this.values.length - 1]

        return min + (bottom - y) / (bottom - top) * (max - min)
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
        const x1 = this.margin.left + (AXIS_LABEL_FONT / 2 - LEFT_GAP) * this.pixel.x

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

            const slot = (stepX + GAP) / this.pixel.x
            const widest = Math.max(0, ...labels.map(label => stringWidth(label, X_LABEL_FONT)))
            const every = Math.max(1, Math.ceil((widest + X_LABEL_SPACING) / slot))

            labels.forEach((label, i) => {
                if (i % every != 0)
                    return

                const x = this.margin.left + i * stepX + (i + 1) * GAP

                items.text(label)
                     .position(x + stepX / 2 + X_LABEL_FONT / 2 * this.pixel.x, y)
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
                 .position(this.getAxisX(label) + X_LABEL_FONT / 2 * this.pixel.x, bottom)
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

    private getHorizontalLines(items: QueueItemsBuilder) {
        const { top, bottom } = this.barBand

        items.line()
             .stop(this.getAxisX(this.barValues[0] ?? 0), top)
             .stop(this.getAxisX(this.barValues[0] ?? 0), bottom)
             .stroke(Theme.line)
             .layer(Layer.Data + 50)
             .key('axis-y')

        for (const value of this.barValues.slice(1)) {
            const x = this.getAxisX(value)

            items.line()
                 .stop(x, top)
                 .stop(x, bottom)
                 .dash([1, 20])
                 .stroke(Theme.lineAxis)
                 .layer(Layer.Base)
                 .key(`grid-x-${ value }`)
        }
    }

    private getBaseLines(items: QueueItemsBuilder) {
        if (this.hasBars)
            this.getHorizontalLines(items)

        if (this.isHorizontal)
            return

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        // Horizontal lines
        items.line()
             .stop(x1, COORDS_MAX_Y - this.margin.bottom)
             .stop(x2, COORDS_MAX_Y - this.margin.bottom)
             .stroke(Theme.line)
             .layer(Layer.Data + 50)
             .key('axis-x')

        for (const value of this.values.slice(1)) {
            const y = this.getAxisY(value)

            items.line()
                 .stop(x1, y)
                 .stop(x2, y)
                 .dash([1, 20])
                 .stroke(Theme.lineAxis)
                 .layer(Layer.Base)
                 .key(`grid-${ value }`)
                 .axisValue(value)
        }
    }

    private calculateLabels() {
        if (this.series.length == 0) {
            this.values = []

            return
        }

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
                     .position((LEFT_PADDING + AXIS_TITLE_FONT / 2) * this.pixel.x, COORDS_MAX_Y / 2)
                     .baseline(TextBaseline.Top)
                     .size(AXIS_TITLE_FONT)
                     .rotate(270)
                     .key('axis-title-x')
            }

            if (this.data.yTitle) {
                // space is reserved in margin.bottom under x-axis labels
                items.text(this.data.yTitle)
                     .position(COORDS_MAX_X / 2, COORDS_MAX_Y - (BOTTOM_PADDING + AXIS_TITLE_FONT / 2) * this.pixel.y)
                     .size(AXIS_TITLE_FONT)
                     .key('axis-title-y')
            }
        }
    }

    private static readonly ghostTypes = [PlotType.Column, PlotType.Bar, PlotType.StackingColumn]

    private readonly handlers
        = new Map<PlotType, (series: PlotSeries) => (items: QueueItemsBuilder) => void>([
        [PlotType.Column, this.getColumns.bind(this)],
        [PlotType.Line, this.getLines.bind(this)],
        [PlotType.Bar, this.getBars.bind(this)],
        [PlotType.StackingColumn, this.getStackedColumns.bind(this)],
        [PlotType.AttentionLine, this.getAttentionLine.bind(this)]
    ])

    private groupHover(item: QueueItemBaseBuilder, series: PlotSeries) {
        if (this.series.length > 1)
            item.hoverGroup(this.getKey(series))
    }

    private getKey(series: PlotSeries, ...parts: (string | number)[]) {
        return [this.data.values.indexOf(series), ...parts].join('-')
    }

    getData() {
        return this.data.values.flatMap(series => {
            if (series.disabled && !PlotProcess.ghostTypes.includes(series.type))
                return []

            const func = this.handlers.get(series.type)

            if (func) {
                return [func(series)]
            }

            Debug.error(`This (${ series.type }) plot type is not implemented`)

            return []
        })
    }

    private getColumns(series: PlotSeries) {
        const baseY = this.getAxisY(0)
        const color = series.color ?? '#ffa500'

        const step = this.getMainStep()
        const index = this.data.values.indexOf(series)

        return (items: QueueItemsBuilder) => {
            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.mainSlots, value)

                const { columns, slots } = this.getColumnGroup(value)
                const visibleBefore = columns.filter(s => this.data.values.indexOf(s) < index).length
                const widthInStep = step / slots
                const width = series.disabled ? 0 : widthInStep
                const offset = visibleBefore * widthInStep

                const column = items.rect()
                     .position(this.margin.left + i * step + (i + 1) * GAP + offset + width / 2, baseY)
                     .size(width, series.disabled ? 0 : Number(value.y) * this.scale.y)
                     .round([16, 16, 0, 0])
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
                         .init(Animations.plotInit, index * Animations.plotInitStagger)
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
                    this.margin.left + (i + 0.5) * step + (i + 1) * GAP,
                    baseY - Number(value.y) * this.scale.y
                )
            })

            line.width(series.width)
                .dash(JSON.parse(series.dash || '[]'))
                .color(series.color ?? '#00ff00')
                .layer(Layer.Data + 1)
                .key(this.getKey(series, 'line'))
                .interact()
                .init(Animations.plotLineInit)

            this.groupHover(line, series)
        }
    }

    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const step = this.getBarStep()

            const barSeries = this.data.values.filter(s => s.type == PlotType.Bar)
            const visibleBefore = barSeries.slice(0, barSeries.indexOf(series)).filter(s => !s.disabled).length
            const heightInStep = step / Math.max(barSeries.filter(s => !s.disabled).length, 1)
            const height = series.disabled ? 0 : heightInStep

            const baseY = this.barBand.bottom - visibleBefore * heightInStep
            const color = series.color ?? '#0000ff'

            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.barSlots, value)
                const x = this.getAxisX(0)
                const y = baseY - i * (step + GAP) - GAP

                const bar = items.rect()
                     .position(x, y)
                     .size(series.disabled ? 0 : Number(value.y) * this.scale.x, height)
                     .round([0, 16, 16, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', x)

                this.dataRect(bar, series, value, i, color, this.getValueTooltip(series, value))
            })
        }
    }

    private getStackedColumns(series: PlotSeries) {
        const baseY = this.getAxisY(0)
        const color = series.color ?? '#a6f022'

        const step = this.getMainStep()

        return (items: QueueItemsBuilder) => {
            series.values.forEach(value => {
                const i = PlotProcess.getSlot(this.mainSlots, value)

                const { columns, slots } = this.getColumnGroup(value)
                const width = step / slots
                const offset = columns.length * width

                const key = PlotProcess.getStackKey(value)
                const stack = this.stacks.get(key) ?? 0
                const height = series.disabled ? 0 : Number(value.y) * this.scale.y

                this.stacks.set(key, stack - height)

                const x = this.margin.left
                          + i * step
                          + (i + 1) * GAP
                          + offset
                const y = baseY + stack

                const column = items.rect()
                     .position(x, y)
                     .size(width, height)
                     .collapse(false, true)
                     .round(this.stackTops.get(key) === series ? [16, 16, 0, 0] : [0, 0, 0, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i, color, this.getValueTooltip(series, value))
                    .fade(false)
            })
        }
    }

    private getValueTooltip(series: PlotSeries, value: PlotPoint) {
        const rows = [series.label, value.label ?? this.formatX(value.x), Formatter.format(value.y, PlotAxisType.Number, this.valuePostfix)]

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
        const y = this.getAxisY(0)
                  - Number(series.values[0].y) * this.scale.y

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const color = series.color ?? '#aa5533'

        return (items: QueueItemsBuilder) => {
            const line = items.line()
                              .stop(x1, y)
                              .stop(x2, y)
                              .width(series.width)
                              .color(color)
                              .layer(Layer.Data + 1)
                              .key(this.getKey(series, 'attention'))
                              .interact()
                              .init(Animations.plotLineInit)

            this.groupHover(line, series)
        }
    }
}