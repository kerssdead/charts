import Point from '@/types/Point'
import { ThemePalette } from '@/Theme'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, Layer } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import { AXIS_LAYER, GRID_DASH, MAX_LINE_DASH } from '@/render/plot/PlotConstants'
import { Axis } from '@/static/Enums'

export default class PlotAxisLines {
    private readonly layout: PlotLayout

    private readonly seriesGroups: PlotSeriesGroups

    private readonly theme: ThemePalette

    constructor(layout: PlotLayout, seriesGroups: PlotSeriesGroups, theme: ThemePalette) {
        this.layout = layout
        this.seriesGroups = seriesGroups
        this.theme = theme
    }

    addItems(items: QueueItemsBuilder) {
        const { layout } = this

        if (this.seriesGroups.rendersBars) {
            const { band, valueScale } = layout.horizontal
            const { top, bottom } = band

            this.addAxisLines(items, valueScale.values, Axis.X, value => {
                const x = valueScale.getCoordinate(value)

                return [{ x, y: top }, { x, y: bottom }]
            })
        }

        if (this.seriesGroups.isHorizontal)
            return

        const x1 = layout.margin.left
        const x2 = COORDS_MAX_X - layout.margin.right

        const { valueScale } = layout.vertical

        this.addAxisLines(items, valueScale.values, Axis.Y, value => {
            const y = valueScale.getCoordinate(value)

            return [{ x: x1, y }, { x: x2, y }]
        })
    }

    private addAxisLines(
        items: QueueItemsBuilder,
        values: number[],
        axis: Axis,
        getLine: (value: number) => [Point, Point]
    ) {
        const [from, to] = getLine(values[0] ?? 0)

        items.line()
             .stop(from.x, from.y)
             .stop(to.x, to.y)
             .stroke(this.theme.line)
             .layer(AXIS_LAYER)
             .key(`axis-${ axis }`)

        for (const value of values.slice(1)) {
            const [from, to] = getLine(value)
            const isMax = this.isMaxLine(value, axis)

            const grid = items.line()
                              .stop(from.x, from.y)
                              .stop(to.x, to.y)
                              .dash(isMax ? MAX_LINE_DASH : GRID_DASH)
                              .stroke(isMax ? this.theme.line : this.theme.lineAxis)
                              .layer(isMax ? AXIS_LAYER : Layer.Base)
                              .key(`grid-${ axis }-${ value }`)

            if (axis === Axis.Y)
                grid.axisValue(value)
        }
    }

    private isMaxLine(value: number, axis: Axis) {
        return value === this.layout.yMax && (axis === Axis.Y || this.seriesGroups.hasOnlyBarSeries)
    }
}