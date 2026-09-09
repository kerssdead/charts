import PlotData from '../types/data/PlotData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '../static/Enums'
import { getRoundedValues } from '../Helper'

export default class PlotProcess {
    private data: PlotData

    private padding: number = 200

    private values: number[] = []

    private get available() {
        return {
            x: COORDS_MAX_X - 2 * this.padding,
            y: COORDS_MAX_Y - 2 * this.padding
        }
    }

    constructor(data: PlotData) {
        this.data = data

        const flatValues = this.data.values.flatMap(s => s.values.map(p => p.y as number))
        this.values = getRoundedValues(flatValues)
    }

    getBase() {
        const x1 = this.padding
        const x2 = COORDS_MAX_X - this.padding

        const intermediateCount = 4

        return (items: QueueItemsBuilder) => {
            items.line()
                 .stop(x1, COORDS_MAX_Y - this.padding)
                 .stop(x2, COORDS_MAX_Y - this.padding)
                 .color('black')
                 .layer(20)

            const step = this.available.y / intermediateCount

            for (let i = 0; i < intermediateCount; i++) {
                const y = this.padding + step * i

                items.line()
                     .stop(x1, y)
                     .stop(x2, y)
                     .dash([1, 20])
                     .color('gray')
                     .layer(0)
            }

            let y = COORDS_MAX_Y - this.padding
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

                const y = COORDS_MAX_Y - this.padding

                let i = 0

                for (const value of this.data.values[0].values) {
                    const x = this.padding + i * stepX + (i + 1) * columnMargin

                    items.text(value.x.toString())
                         .position(x + stepX / 2, y + this.padding / 2)
                         .align(TextAlignment.Left)
                         .size(12)
                         .color('black')

                    i++
                }
            }
        }
    }

    getData() {
        const range = Math.abs(Math.max(...this.values)) + Math.abs(Math.min(...this.values))
        // todo: better name?
        const scale = this.available.y / range

        const y = COORDS_MAX_Y - this.padding

        const columnMargin = 30

        const count = Math.max(...this.data.values.map(s => s.values.length))
        const step = (this.available.x - columnMargin) / count - columnMargin
        const seriesCount = this.data.values.length
        const widthInStep = step / seriesCount

        return (items: QueueItemsBuilder) => {
            const colors = ['orange', 'green', 'blue']
            let seriesIndex = 0;

            for (const series of this.data.values) {
                let i = 0;

                for (const value of series.values) {
                    const x = this.padding + i * step + seriesIndex * widthInStep + (i + 1) * columnMargin
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