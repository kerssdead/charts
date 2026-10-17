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

// todo: check rendering multiple series when some of them is not have all x-axis points
// todo: if series.length > 1 then on mouse over series item highlight all values from this series

export default class PlotProcess {
    private data: PlotData

    private readonly series: PlotSeries[]

    private margin: Margin

    private isBothTypes: boolean

    private stacks: Map<string, number>

    private values: number[] = []

    private zero: Point

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
        return {
            x: this.available.x / this.range,
            y: this.available.y / this.range
        }
    }

    private get range() {
        return Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
    }

    constructor(data: PlotData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.valuePostfix = settings.valuePostfix
        this.series = data.values.filter(series => !series.disabled)
        this.yMax = this.data.yMax == 0 ? undefined : this.data.yMax
        this.pixel = pixel

        this.stacks = new Map<string, number>()
        this.zero = {
            x: -1,
            y: -1
        }

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

        const labels = this.isHorizontal
                       ? this.getCategories()
                       : this.values.map(value => short(value, this.data.shortLabels))

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
        const bottom = COORDS_MAX_Y - this.margin.bottom

        if (this.values.length < 2)
            return bottom

        const min = this.values[0]
        const max = this.values[this.values.length - 1]

        return max == min
               ? bottom
               : bottom - (value - min) / (max - min) * this.available.y
    }

    get isHorizontal() {
        return this.data.values.length > 0
               && this.data.values.every(series => series.type == PlotType.Bar)
    }

    private getCategories() {
        const longest = this.data.values.reduce((acc: PlotSeries | null, series) => {
            return !acc || series.values.length > acc.values.length ? series : acc
        }, null)

        return longest?.values.map(value => this.formatX(value.x)) ?? []
    }

    private formatX(x: number | Date | string) {
        return Formatter.axis(x, this.data.xType)
    }

    getAxisX(value: number) {
        if (this.values.length < 2)
            return this.margin.left

        const min = this.values[0]
        const max = this.values[this.values.length - 1]

        return max == min
               ? this.margin.left
               : this.margin.left + (value - min) / (max - min) * this.available.x
    }

    getAxisValue(y: number) {
        const bottom = COORDS_MAX_Y - this.margin.bottom

        if (this.values.length < 2 || this.available.y == 0)
            return 0

        const min = this.values[0]
        const max = this.values[this.values.length - 1]

        return min + (bottom - y) / this.available.y * (max - min)
    }

    private getZero() {
        return {
            x: this.zero.x,
            y: this.zero.y == -1
               ? COORDS_MAX_Y - this.margin.bottom
               : this.zero.y
        }
    }

    getBase() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        const barSeriesCount = this.series.filter(s => s.type == PlotType.Bar).length
        this.isBothTypes = barSeriesCount > 0 && barSeriesCount != this.series.length

        return (items: QueueItemsBuilder) => {
            this.getBaseLabels(items)
            this.getBaseLines(items)
        }
    }

    private getBaseLabels(items: QueueItemsBuilder) {
        const x1 = this.margin.left + (AXIS_LABEL_FONT / 2 - LEFT_GAP) * this.pixel.x

        if (this.isHorizontal)
            return this.getHorizontalLabels(items, x1)

        const intermediateCount = 4

        let i = 0

        if (this.isBothTypes) {
            this.margin.top += 100

            i = 0
            const step = (this.available.x - GAP * 2) / (this.values.length - 1)

            // Top labels
            for (const label of this.values) {
                const x = this.margin.left + GAP + i * step

                // todo: test long values visibility/offset
                items.text(short(label, this.data.shortLabels))
                     .position(x, this.margin.top - GAP * 2)
                     .align(TextAlignment.Center)

                i++
            }

            // Right labels
            const count = Math.max(...this.series.map(s => s.values.length))
            // todo: remove columnMargin from here ?
            const stepY = (this.available.y - GAP) / count - GAP

            const x = COORDS_MAX_X - this.margin.right + GAP * 2

            i = 0

            for (const value of this.series[0].values) {
                const y = COORDS_MAX_Y - this.margin.bottom - i * stepY - (i + 1) * GAP

                items.text(this.formatX(value.x))
                     .position(x, y - stepY / 2)
                     .align(TextAlignment.Left)
                     .size(12)

                i++
            }
        }

        let step = this.available.y / intermediateCount

        // Left labels
        let y = COORDS_MAX_Y - this.margin.bottom
        for (const label of this.values) {
            // todo: test long values visibility/offset
            items.text(short(label, this.data.shortLabels))
                 .position(x1, y)
                 .size(AXIS_LABEL_FONT)
                 .align(TextAlignment.Right)
                 .key(`y-label-${ label }`)
                 .axisValue(label)

            if (label == 0) {
                this.zero.y = y
            }

            y -= step
        }

        if (this.series.length > 0) {
            // Bottom labels
            const count = Math.max(...this.series.map(s => s.values.length))
            const stepX = (this.available.x - GAP) / count - GAP

            const y = COORDS_MAX_Y - this.margin.bottom

            const labels = this.series[0].values.map(value => this.formatX(value.x))

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
        const bottom = COORDS_MAX_Y - this.margin.bottom

        // Bottom labels
        for (const label of this.values) {
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

        const step = (this.available.y - GAP) / categories.length - GAP

        categories.forEach((category, i) => {
            const groupBottom = this.getZero().y - i * (step + GAP) - GAP

            items.text(category)
                 .position(x1, groupBottom - step / 2)
                 .size(AXIS_LABEL_FONT)
                 .align(TextAlignment.Right)
                 .key(`y-category-${ i }`)
        })
    }

    private getHorizontalLines(items: QueueItemsBuilder) {
        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom

        items.line()
             .stop(this.getAxisX(this.values[0] ?? 0), top)
             .stop(this.getAxisX(this.values[0] ?? 0), bottom)
             .stroke(Theme.line)
             .layer(Layer.Data + 50)
             .key('axis-y')

        for (const value of this.values.slice(1)) {
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
        if (this.isHorizontal)
            return this.getHorizontalLines(items)

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

        if (this.series.filter(s => s.type == PlotType.StackingColumn).length > 0) {
            let allValues: Map<string, number> = new Map()

            for (const series of this.series) {
                for (const value of series.values) {
                    const key = value.x.toString()
                    const v = allValues.get(key) ?? 0

                    allValues.set(key, v + (value.y as number))
                }
            }

            this.values = getRoundedValues(Array.from(allValues.values()), 5, this.yMax)
        } else {
            let flatValues = this.series.flatMap(s => s.values.map(p => p.y as number))
            while (flatValues.length < 5) {
                flatValues.push(flatValues[0])
            }
            this.values = getRoundedValues(flatValues, 5, this.yMax)
        }
    }

    // todo: remove title from arg
    getTitles(title: string | null) {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            // todo: this title should be rendered on another layer/canvas/space
            if (title) {
                items.text(title)
                     .position(COORDS_MAX_X / 2, 150)
                     .size(20)
                     .key('title')

                // todo: bad
                if (this.margin.bottom < 320) {
                    this.margin.top = 320
                }
            }

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
        const baseY = this.getZero().y
        const color = series.color ?? '#ffa500'

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - GAP) / count - GAP

        const columnSeries = this.data.values.filter(s => s.type == PlotType.Column)
        const visibleBefore = columnSeries.slice(0, columnSeries.indexOf(series)).filter(s => !s.disabled).length
        const widthInStep = step / Math.max(columnSeries.filter(s => !s.disabled).length, 1)
        const width = series.disabled ? 0 : widthInStep
        const offset = visibleBefore * widthInStep

        return (items: QueueItemsBuilder) => {
            series.values.forEach((value, i) => {
                const column = items.rect()
                     .position(this.margin.left + i * step + (i + 1) * GAP + offset + width / 2, baseY)
                     .size(width, series.disabled ? 0 : Number(value.y) * this.scale.y)
                     .round([16, 16, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i, color,
                    `${ value.label ?? this.formatX(value.x) }\n${ Formatter.format(value.y, PlotAxisType.Number, this.valuePostfix) }`)
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

        if (series.disabled)
            item.ghost()

        return item
    }

    private getLines(series: PlotSeries) {
        const baseY = this.getZero().y

        const count = Math.max(...this.series.map(s => s.values.length))
        const step = (this.available.x - GAP) / count - GAP

        return (items: QueueItemsBuilder) => {
            const line = items.line()

            series.values.forEach((value, i) => {
                line.stop(
                    this.margin.left + (i + 0.5) * step + (i + 1) * GAP,
                    baseY - Number(value.y) * this.scale.y
                )
            })

            line.width(series.width)
                .dash(JSON.parse(series.dash ?? '[]'))
                .color(series.color ?? '#00ff00')
                .layer(Layer.Data)
                .key(this.getKey(series, 'line'))
                .interact()
                .init(Animations.plotLineInit)
        }
    }

    // todo: if there is columns/lines with bars add second base lines
    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const count = Math.max(...this.data.values.map(s => s.values.length))
            const step = (this.available.y - GAP) / count - GAP

            const barSeries = this.data.values.filter(s => s.type == PlotType.Bar)
            const visibleBefore = barSeries.slice(0, barSeries.indexOf(series)).filter(s => !s.disabled).length
            const heightInStep = step / Math.max(barSeries.filter(s => !s.disabled).length, 1)
            const height = series.disabled ? 0 : heightInStep

            const baseY = this.getZero().y - visibleBefore * heightInStep
            const color = series.color ?? '#0000ff'

            series.values.forEach((value, i) => {
                const x = this.margin.left
                const y = baseY - i * (step + GAP) - GAP

                const bar = items.rect()
                     .position(x, y)
                     .size(series.disabled ? 0 : Number(value.y) * this.scale.x, height)
                     .round([0, 16, 16, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('x', x)

                this.dataRect(bar, series, value, i, color)
            })
        }
    }

    private getStackedColumns(series: PlotSeries) {
        const baseY = this.getZero().y
        const color = series.color ?? '#a6f022'

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - GAP) / count - GAP

        const isLast = series === this.series[this.series.length - 1]
        const round = isLast ? [16, 16, 0, 0] : [0, 0, 0, 0]

        return (items: QueueItemsBuilder) => {
            series.values.forEach((value, i) => {
                const key = value.x.toString()
                const stack = this.stacks.get(key) ?? 0
                const height = series.disabled ? 0 : Number(value.y) * this.scale.y

                this.stacks.set(key, stack - height)

                const x = this.margin.left
                          + i * step
                          + (i + 1) * GAP
                const y = baseY + stack

                const column = items.rect()
                     .position(x, y)
                     .size(step, height)
                     .collapse(false, true)
                     .round(round)
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .grow('y', baseY)

                this.dataRect(column, series, value, i, color)
                    .fade(false)
            })
        }
    }

    private getAttentionLine(series: PlotSeries) {
        const y = this.getZero().y
                  - Number(series.values[0].y) * this.scale.y

        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const color = series.color ?? '#aa5533'

        return (items: QueueItemsBuilder) => {
            items.line()
                 .stop(x1, y)
                 .stop(x2, y)
                 .width(series.width)
                 .color(color)
                 .layer(Layer.Data)
                 .key(this.getKey(series, 'attention'))
                 .interact()
                 .init(Animations.plotLineInit)
        }
    }
}