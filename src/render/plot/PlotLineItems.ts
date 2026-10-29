import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X } from '@/static/constants/Index'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'
import { PlotType } from '@/static/Enums'

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
            const line = items.line()

            const slots = series.values.map(value => ({ value, slot: categoryScale.getSlot(value) }))
                                .sort((a, b) => a.slot - b.slot)

            slots.forEach(({ value, slot }) => {
                line.stop(
                    categoryScale.getSlotCenter(slot),
                    baseline - layout.capToYMax(Number(value.y)) * valueScale.lengthPerUnit,
                    this.style.getValueTooltip(series, value)
                )
            })

            line.dash(Array.isArray(series.dash) ? series.dash : [])
                .gradient()

            if (series.type == PlotType.Area)
                line.area(baseline)

            this.style.styleLine(line, series, 'line')
        }
    }

    getAttentionItems(series: PlotSeries) {
        if (series.values.length == 0)
            return QueueItemsBuilder.empty

        const { layout } = this

        const { valueScale, baseline } = layout.vertical

        const y = baseline - layout.capToYMax(Number(series.values[0].y)) * valueScale.lengthPerUnit

        const x1 = layout.margin.left
        const x2 = COORDS_MAX_X - layout.margin.right

        return (items: QueueItemsBuilder) => {
            this.style.styleLine(items.line().stop(x1, y).stop(x2, y), series, 'attention')
        }
    }
}