import Point from '@/types/Point'
import Theme from '@/Theme'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, Layer } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { AXIS_LAYER, GRID_DASH } from '@/render/plot/PlotConstants'

export default class PlotAxisLines {
    private readonly layout: PlotLayout

    private readonly seriesGroups: PlotSeriesGroups

    constructor(layout: PlotLayout, seriesGroups: PlotSeriesGroups) {
        this.layout = layout
        this.seriesGroups = seriesGroups
    }

    addItems(items: QueueItemsBuilder) {
        const { layout } = this

        if (this.seriesGroups.hasBars) {
            const { band, valueScale } = layout.horizontal
            const { top, bottom } = band

            this.addAxisLines(items, valueScale.values, 'x', value => {
                const x = valueScale.getCoordinate(value)

                return [{ x, y: top }, { x, y: bottom }]
            })
        }

        if (this.seriesGroups.isHorizontal)
            return

        const x1 = layout.margin.left
        const x2 = COORDS_MAX_X - layout.margin.right

        const { valueScale } = layout.vertical

        this.addAxisLines(items, valueScale.values, 'y', value => {
            const y = valueScale.getCoordinate(value)

            return [{ x: x1, y }, { x: x2, y }]
        })
    }

    private addAxisLines(
        items: QueueItemsBuilder,
        values: number[],
        axis: 'x' | 'y',
        getLine: (value: number) => [Point, Point]
    ) {
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
}