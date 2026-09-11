import PlotData from '../types/data/PlotData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '../static/Enums'
import { getRoundedValues } from '../Helper'
import Margin from '../types/Margin'

export default class PlotProcess {
    private data: PlotData

    private margin: Margin

    private values: number[] = []

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
    }

    getBase() {
        const x1 = this.margin.left
        const x2 = COORDS_MAX_X - this.margin.right

        const intermediateCount = 4

        return (items: QueueItemsBuilder) => {
            items.line()
                 .stop(x1, COORDS_MAX_Y - this.margin.bottom)
                 .stop(x2, COORDS_MAX_Y - this.margin.bottom)
                 .color('black')
                 .layer(20)

            const step = this.available.y / intermediateCount

            for (let i = 0; i < intermediateCount; i++) {
                const y = this.margin.top + step * i

                items.line()
                     .stop(x1, y)
                     .stop(x2, y)
                     .dash([1, 20])
                     .color('gray')
                     .layer(0)
            }

            let y = COORDS_MAX_Y - this.margin.bottom
            for (const label of this.values) {
                items.text(label.toString())
                     .position(x1, y)
                     .align(TextAlignment.Right)
                     .color('black')

                y -= step
            }

            if (this.data.values.length > 0) {
                const columnMargin = 30
                const count = Math.max(...this.data.values.map(s => s.values.length))
                const stepX = (this.available.x - columnMargin) / count - columnMargin

                const y = COORDS_MAX_Y - this.margin.bottom

                let i = 0

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
    }

    // todo: remove title from arg
    getTitles(title: string | null) {
        return (items: QueueItemsBuilder) => {
            if (title) {
                items.text(title)
                     .position(COORDS_MAX_X / 2, 150)
                     .size(20)

                this.margin.top = 320
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

                this.margin.bottom = 300
            }
        }
    }

    getData() {
        return this.getColumns()
    }

    private getColumns() {
        const range = Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
        // todo: better name?
        const scale = this.available.y / range

        const y = COORDS_MAX_Y - this.margin.bottom

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - this.columnMargin) / count - this.columnMargin
        const seriesCount = this.data.values.length
        const widthInStep = step / seriesCount

        return (items: QueueItemsBuilder) => {
            const colors = ['orange', 'green', 'blue']
            let seriesIndex = 0;

            for (const series of this.data.values) {
                let i = 0;

                for (const value of series.values) {
                    const x = this.margin.left + i * step + seriesIndex * widthInStep + (i + 1) * this.columnMargin
                    const height = value.y as number * scale

                    items.rect()
                         .position(x, y)
                         .size(widthInStep, height)
                         .fill()
                         .round([16, 16, 0, 0])
                         .align(HorizontalAlignment.Left, VerticalAlignment.Bottom)
                         .color(series.color ?? colors[seriesIndex])

                    i++
                }

                seriesIndex++
            }
        }
    }
}