import PlotData from '../types/data/PlotData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import { HorizontalAlignment, PlotType, TextAlignment, VerticalAlignment } from '../static/Enums'
import { getRoundedValues } from '../Helper'
import Margin from '../types/Margin'
import PlotSeries from '../types/PlotSeries'
import Debug from '../Debug'

export default class PlotProcess {
    private data: PlotData

    private margin: Margin

    private readonly isBothTypes: boolean

    private readonly values: number[] = []

    // todo: move margin outside
    private readonly columnMargin = 30

    private get available() {
        return {
            x: COORDS_MAX_X - this.margin.left - this.margin.right,
            y: COORDS_MAX_Y - this.margin.top - this.margin.bottom
        }
    }

    constructor(data: PlotData) {
        this.data = data

        const flatValues = this.data.values.flatMap(s => s.values.map(p => p.y as number))
        this.values = getRoundedValues(flatValues)

        this.margin = {
            top: 200,
            right: 200,
            bottom: 200,
            left: 200
        }

        this.isBothTypes = this.data.values.filter(s => s.type == PlotType.Bar).length != this.data.values.length
    }

    getBase() {
        return (items: QueueItemsBuilder) => {
            this.getBaseLabels(items)
            this.getBaseLines(items)
        }
    }

    private getBaseLabels(items: QueueItemsBuilder) {
        const columnMargin = 30
        const x1 = this.margin.left

        const intermediateCount = 4

        let i = 0

        if (this.isBothTypes) {
            this.margin.top += 100

            i = 0
            const step = this.available.x / (this.values.length - 1)

            // Top labels
            for (const label of this.values) {
                const x = this.margin.left + i * step

                // todo: test long values visibility/offset
                items.text(label.toString())
                     .position(x, this.margin.top - 50)
                     .align(TextAlignment.Center)
                     .color('black')

                i++
            }

            // Right labels
            // const columnMargin = 30
            const count = Math.max(...this.data.values.map(s => s.values.length))
            // todo: remove columnMargin from here ?
            const stepX = (this.available.y - columnMargin) / count - columnMargin

            const x = COORDS_MAX_X - this.margin.right

            i = 0

            for (const value of this.data.values[0].values) {
                const y = COORDS_MAX_Y - this.margin.bottom - i * stepX - (i + 1) * columnMargin

                items.text(value.x.toString())
                     .position(x, y - stepX / 2)
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
            items.text(label.toString())
                 .position(x1, y)
                 .align(TextAlignment.Right)
                 .color('black')

            y -= step
        }

        if (this.data.values.length > 0) {
            // Bottom labels
            const count = Math.max(...this.data.values.map(s => s.values.length))
            const stepX = (this.available.x - columnMargin) / count - columnMargin

            const y = COORDS_MAX_Y - this.margin.bottom

            i = 0

            for (const value of this.data.values[0].values) {
                const x = this.margin.left + i * stepX + (i + 1) * columnMargin

                items.text(value.x.toString())
                     .position(x + stepX / 2, y + this.margin.left / 2)
                     .align(TextAlignment.Left)
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

    // todo: remove title from arg
    getTitles(title: string | null) {
        return (items: QueueItemsBuilder) => {
            if (title) {
                items.text(title)
                     .position(COORDS_MAX_X / 2, 150)
                     .size(20)

                if (this.margin.bottom < 320) {
                    this.margin.top = 320
                }
            }

            if (this.data.xTitle) {
                items.text(this.data.xTitle)
                     .position(this.margin.left / 2, COORDS_MAX_Y / 2)
                     .size(14)
                     .rotate(270)
            }

            if (this.data.yTitle) {
                items.text(this.data.yTitle)
                     .position(COORDS_MAX_X / 2, COORDS_MAX_Y - this.margin.bottom / 2)
                     .size(14)

                if (this.margin.bottom < 300) {
                    this.margin.bottom = 300
                }
            }
        }
    }

    getData() {
        // todo: remove, only for test
        this.data.values = [
            JSON.parse(JSON.stringify(this.data.values[0])),
            JSON.parse(JSON.stringify(this.data.values[0])),
            JSON.parse(JSON.stringify(this.data.values[0]))
        ]

        // todo: remove, only for test
        this.data.values[0].type = PlotType.Column
        // todo: remove, only for test
        this.data.values[1].type = PlotType.Line
        // todo: remove, only for test
        this.data.values[2].type = PlotType.Bar

        let result = []

        for (const series of this.data.values) {
            switch (series.type) {
                case PlotType.Column:
                    result.push(this.getColumns(series))
                    break

                case PlotType.Line:
                    result.push(this.getLines(series))
                    break

                case PlotType.Bar:
                    result.push(this.getBars(series))
                    break

                default:
                    Debug.error(`This (${series.type}) plot type is not implemented`)
            }
        }

        return result
    }

    // todo: use group ?
    private getColumns(series: PlotSeries) {
        const range = Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
        // todo: better name?
        const scale = this.available.y / range

        const y = COORDS_MAX_Y - this.margin.bottom

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - this.columnMargin) / count - this.columnMargin
        const seriesCount = this.data.values.filter(s => s.type == PlotType.Column).length
        const widthInStep = step / seriesCount

        return (items: QueueItemsBuilder) => {
            let seriesIndex = 0

            let i = 0

            for (const value of series.values) {
                const x = this.margin.left + i * step + seriesIndex * widthInStep + (i + 1) * this.columnMargin
                const height = value.y as number * scale

                items.rect()
                     .position(x, y)
                     .size(widthInStep, height)
                     .fill()
                     .round([16, 16, 0, 0])
                     .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                     .color(series.color ?? '#ffa50077')

                i++
            }
        }
    }

    private getLines(series: PlotSeries) {
        const range = Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
        // todo: better name?
        const scale = this.available.y / range

        const y = COORDS_MAX_Y - this.margin.bottom

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - this.columnMargin) / count - this.columnMargin

        return (items: QueueItemsBuilder) => {

            let line     = items.line()
            let i = 0

            for (const value of series.values) {
                const x = this.margin.left + i * step + step / 2 + (i + 1) * this.columnMargin
                const height = value.y as number * scale

                line.stop(x, y - height)

                i++
            }

            line.color(series.color ?? '#00ff0077')
        }
    }

    // todo: if there is columns/lines with bars add second base lines
    // todo: use group ?
    private getBars(series: PlotSeries) {
        return (items: QueueItemsBuilder) => {
            const range = Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
            // todo: better name?
            const scale = this.available.x / range

            const count = Math.max(...this.data.values.map(s => s.values.length))
            const step = (this.available.y - this.columnMargin) / count - this.columnMargin
            const seriesCount = this.data.values.filter(s => s.type == PlotType.Bar).length
            const heightInStep = step / seriesCount

            let i = 0

            for (const value of series.values) {
                const y = COORDS_MAX_Y - this.margin.bottom - i * step - step / 2 - (i + 1) * this.columnMargin

                items.rect()
                     .position(this.margin.left, y)
                     .size(value.y as number * scale,
                         heightInStep)
                     .round([0, 16, 16, 0])
                     .align(HorizontalAlignment.Left, null)
                     .fill()
                     .color(series.color ?? '#0000ff77')

                i++
            }
        }
    }
}