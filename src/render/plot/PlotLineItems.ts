import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import { PlotType } from '@/static/Enums'
import PlotPoint, { getY } from '@/types/PlotPoint'

type LineStop = {
    value: PlotPoint
    y: number
    slot: number
}

export default class PlotLineItems {
    private readonly layout: PlotLayout

    private readonly style: PlotItemStyle

    constructor(layout: PlotLayout, style: PlotItemStyle) {
        this.layout = layout
        this.style = style
    }

    getItems(series: PlotSeries) {
        const { layout } = this
        const { categoryScale, valueScale, baseline } = layout.vertical

        return (items: QueueItemsBuilder) => {
            this.getUnbrokenRuns(series).forEach((run, runIndex) => {
                const line = items.line()

                run.forEach(({ value, y, slot }) => {
                    line.stop(
                        categoryScale.getSlotCenter(slot),
                        valueScale.getCoordinate(y),
                        this.style.getValueTooltip(series, value)
                    )
                })

                line.clip(this.plotBox)
                    .dash(Array.isArray(series.dash) ? series.dash : [])
                    .drawMode(series.drawMode)
                    .gradient()

                if (series.type == PlotType.Area)
                    line.area(baseline)

                this.style.styleLine(line, series, `line-${ runIndex }`)
            })
        }
    }

    private getUnbrokenRuns(series: PlotSeries) {
        const { categoryScale, valueScale } = this.layout.vertical

        const stops = series.values.map(value => ({ value, y: getY(value), slot: categoryScale.getSlot(value) }))
                            .sort((a, b) => a.slot - b.slot)

        const runs: LineStop[][] = [[]]

        for (const { value, y, slot } of stops) {
            if (valueScale.canShow(y))
                runs[runs.length - 1].push({ value, y, slot })
            else if (runs[runs.length - 1].length > 0)
                runs.push([])
        }

        return runs.filter(run => run.length > 0)
    }

    getAttentionItems(series: PlotSeries) {
        const { layout } = this

        const { valueScale } = layout.vertical

        const value = series.values.length > 0 ? getY(series.values[0]) : null

        if (!valueScale.canShow(value))
            return QueueItemsBuilder.empty

        const y = valueScale.getCoordinate(value)

        const x1 = layout.margin.left
        const x2 = COORDS_MAX_X - layout.margin.right

        return (items: QueueItemsBuilder) => {
            this.style.styleLine(items.line().stop(x1, y).stop(x2, y).clip(this.plotBox), series, 'attention')
        }
    }

    private get plotBox() {
        const { margin, vertical } = this.layout
        const { top, bottom } = vertical.band

        return {
            x: margin.left,
            y: top,
            width: COORDS_MAX_X - margin.left - margin.right,
            height: bottom - top
        }
    }
}