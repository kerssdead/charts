import PlotData from '../types/data/PlotData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import {COORDS_MAX_X, COORDS_MAX_Y} from 'static/constants/Index'
import {HorizontalAlignment, PlotType, TextAlignment, TextBaseline, VerticalAlignment} from '../static/Enums'
import { getRoundedValues, short } from '../Helper'
import Margin from '../types/Margin'
import PlotSeries from '../types/PlotSeries'
import Debug from '../Debug'
import Point from '../types/Point'
import Theme from "../Theme";

const GAP = 30

// todo: check rendering multiple series when some of them is not have all x-axis points
// todo: if series.length > 1 then on mouse over series item highlight all values from this series
// todo: add init animation
// todo: add context menu

export default class PlotProcess {
    private data: PlotData

    private margin: Margin

    private isBothTypes: boolean

    private stacks: Map<string, number>

    private values: number[] = []

    private zero: Point

    private readonly charPrecision: number

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

    constructor(data: PlotData, charPrecision: number) {
        this.data = data
        this.data.yMax = this.data.yMax as number == 0 ? undefined : this.data.yMax as number
        this.charPrecision = charPrecision

        this.stacks = new Map<string, number>()
        this.zero = {
            x: -1,
            y: -1
        }

        this.calculateLabels()

        const maxLengthLeft = Math.max(...this.values.map(str => short(str, this.data.shortLabels).length)) + 1

        this.margin = {
            top: 200,
            right: 100,
            bottom: 200,
            // todo: fix: not change on recalculate sizes
            left: 150 + maxLengthLeft * this.charPrecision
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

    private getZero() {
        return {
            x: this.zero.x,
            y: this.zero.y == -1
                ? COORDS_MAX_Y - this.margin.bottom
                : this.zero.y,
        }
    }

    getBase() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        const barSeriesCount = this.data.values.filter(s => s.type == PlotType.Bar).length
        this.isBothTypes = barSeriesCount > 0 && barSeriesCount != this.data.values.length

        return (items: QueueItemsBuilder) => {
            this.getBaseLabels(items)
            this.getBaseLines(items)
        }
    }

    private getBaseLabels(items: QueueItemsBuilder) {
        const x1 = this.margin.left

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
                    .color('black')

                i++
            }

            // Right labels
            const count = Math.max(...this.data.values.map(s => s.values.length))
            // todo: remove columnMargin from here ?
            const stepY = (this.available.y - GAP) / count - GAP

            const x = COORDS_MAX_X - this.margin.right + GAP * 2

            i = 0

            for (const value of this.data.values[0].values) {
                const y = COORDS_MAX_Y - this.margin.bottom - i * stepY - (i + 1) * GAP

                items.text(value.x.toString())
                    .position(x, y - stepY / 2)
                    .align(TextAlignment.Left)
                    .size(12)
                    .color('black')

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
                .align(TextAlignment.Right)
                .color('black')

            if (label == 0) {
                this.zero.y = y
            }

            y -= step
        }

        if (this.data.values.length > 0) {
            // Bottom labels
            const count = Math.max(...this.data.values.map(s => s.values.length))
            const stepX = (this.available.x - GAP) / count - GAP

            const y = COORDS_MAX_Y - this.margin.bottom

            i = 0

            for (const value of this.data.values[0].values) {
                const x = this.margin.left + i * stepX + (i + 1) * GAP

                items.text(value.x.toString())
                    .position(x + stepX / 2, y)
                    .align(TextAlignment.Left)
                    .baseline(TextBaseline.Top)
                    .size(12)
                    .color('black')

                i++
            }
        }
    }

    private getBaseLines(items: QueueItemsBuilder) {
        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const intermediateCount = 4

        let step = this.available.y / intermediateCount

        // Horizontal lines
        items.line()
            .stop(x1, COORDS_MAX_Y - this.margin.bottom)
            .stop(x2, COORDS_MAX_Y - this.margin.bottom)
            .color('black')
            .layer(20)

        for (let i = 0; i < intermediateCount; i++) {
            const y = this.margin.top + step * i

            items.line()
                .stop(x1, y)
                .stop(x2, y)
                .dash([1, 20])
                .color('gray')
                .layer(0)
        }
    }

    private calculateLabels() {
        if (this.data.values.filter(s => s.type == PlotType.StackingColumn).length > 0) {
            let allValues: Map<string, number> = new Map()

            for (const series of this.data.values) {
                for (const value of series.values) {
                    const key = value.x.toString()
                    const v = allValues.get(key) ?? 0

                    allValues.set(key, v + (value.y as number))
                }
            }

            this.values = getRoundedValues(Array.from(allValues.values()), 5, this.data.yMax)
        } else {
            let flatValues = this.data.values.flatMap(s => s.values.map(p => p.y as number))
            while (flatValues.length < 5) {
                flatValues.push(flatValues[0])
            }
            this.values = getRoundedValues(flatValues, 5, this.data.yMax)
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
                    .color(Theme.text)

                // todo: bad
                if (this.margin.bottom < 320) {
                    this.margin.top = 320
                }
            }

            if (this.data.xTitle) {
                items.text(this.data.xTitle)
                    // todo: "this.charPrecision * 4" very bad solution
                    .position(this.charPrecision * 4, COORDS_MAX_Y / 2)
                    .baseline(TextBaseline.Top)
                    .size(14)
                    .rotate(270)
                    .color(Theme.text)
            }

            if (this.data.yTitle) {
                items.text(this.data.yTitle)
                    .position(COORDS_MAX_X / 2, COORDS_MAX_Y - this.margin.bottom / 2)
                    .size(14)
                    .color(Theme.text)

                if (this.margin.bottom < 300) {
                    this.margin.bottom = 300
                }
            }
        }
    }

    private readonly handlers
        = new Map<PlotType, (series: PlotSeries) => (items: QueueItemsBuilder) => void>([
        [PlotType.Column, this.getColumns.bind(this)],
        [PlotType.Line, this.getLines.bind(this)],
        [PlotType.Bar, this.getBars.bind(this)],
        [PlotType.StackingColumn, this.getStackedColumns.bind(this)],
        [PlotType.AttentionLine, this.getAttentionLine.bind(this)]
    ])

    getData() {
        return this.data.values.flatMap(series => {
            const func = this.handlers.get(series.type)

            if (func) {
                return [func(series)]
            }

            Debug.error(`This (${series.type}) plot type is not implemented`)

            return []
        })
    }

    private getColumns(series: PlotSeries) {
        const baseY = this.getZero().y
        const color = series.color ?? '#ffa500'

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - GAP) / count - GAP

        const columnSeries = this.data.values.filter(s => s.type == PlotType.Column)
        const widthInStep = step / columnSeries.length
        const offset = columnSeries.indexOf(series) * widthInStep

        return (items: QueueItemsBuilder) => {
            series.values.forEach((value, i) => {
                items.rect()
                     .position(this.margin.left + (i + 0.5) * step + offset + (i + 1) * GAP, baseY)
                     .size(widthInStep, Number(value.y) * this.scale.y)
                     .fill()
                     .round([16, 16, 0, 0])
                     .align(HorizontalAlignment.Center, VerticalAlignment.Bottom)
                     .color(color)
                     .tooltip(`${value.label}\n${value.y}`)
                     .interact()
            })
        }
    }

    private getLines(series: PlotSeries) {
        const baseY = this.getZero().y

        const count = Math.max(...this.data.values.map(s => s.values.length))
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
                .interact()
        }
    }

    // todo: if there is columns/lines with bars add second base lines
    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const count = Math.max(...this.data.values.map(s => s.values.length))
            const step = (this.available.y - GAP) / count - GAP
            const seriesCount = this.data.values.filter(s => s.type == PlotType.Bar).length
            const heightInStep = step / seriesCount

            const seriesIndex = this.data.values
                                    .filter(s => s.type == PlotType.Bar)
                                    .indexOf(series)

            const baseY = this.getZero().y - seriesIndex * heightInStep
            const color = series.color ?? '#0000ff'

            series.values.forEach((value, i) => {
                const x =this.margin.left
                const y = baseY - (i + 1) * (step + GAP)

                items.rect()
                     .position(x, y)
                     .size(Number(value.y) * this.scale.x, heightInStep)
                     .round([0, 16, 16, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .fill()
                     .color(color)
                     .interact()
            })
        }
    }

    private getStackedColumns(series: PlotSeries) {
        const baseY = this.getZero().y
        const color = series.color ?? '#a6f022'

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - GAP) / count - GAP

        const isLast = series === this.data.values[this.data.values.length - 1]
        const round = isLast ? [16, 16, 0, 0] : [0, 0, 0, 0]

        return (items: QueueItemsBuilder) => {
            series.values.forEach((value, i) => {
                const key = value.x.toString()
                const stack = this.stacks.get(key) ?? 0
                const height = Number(value.y) * this.scale.y

                this.stacks.set(key, stack - height)

                const x = this.margin.left
                          + i * step
                          + (i + 1) * GAP
                const y = baseY + stack

                items.rect()
                     .position(x, y)
                     .size(step, height)
                     .fill()
                     .round(round)
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .color(color)
                     .interact()
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
                .interact()
        }
    }
}