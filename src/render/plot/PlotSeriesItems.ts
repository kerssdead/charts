import PlotSeries from '@/types/PlotSeries'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { PlotType } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotItemStyle, { ValueTooltip } from '@/render/plot/PlotItemStyle'
import PlotColumnItems from '@/render/plot/PlotColumnItems'
import PlotStackedColumnItems from '@/render/plot/PlotStackedColumnItems'
import PlotBarItems from '@/render/plot/PlotBarItems'
import PlotLineItems from '@/render/plot/PlotLineItems'
import { getColumnGroups } from '@/render/plot/PlotColumnGroups'
import { GHOST_TYPES } from '@/render/plot/PlotConstants'
import { ThemePalette } from '@/Theme'

export default class PlotSeriesItems {
    private readonly seriesGroups: PlotSeriesGroups

    private readonly columns: PlotColumnItems

    private readonly stackedColumns: PlotStackedColumnItems

    private readonly bars: PlotBarItems

    private readonly lines: PlotLineItems

    constructor(
        private readonly allSeries: PlotSeries[],
        layout: PlotLayout,
        getValueTooltip: ValueTooltip,
        theme: ThemePalette
    ) {
        const seriesGroups = layout.seriesGroups
        const style = new PlotItemStyle(layout, seriesGroups, getValueTooltip, theme)
        const columnGroups = getColumnGroups(seriesGroups.enabledSeries)

        this.seriesGroups = seriesGroups
        this.columns = new PlotColumnItems(layout, style, seriesGroups, columnGroups)
        this.stackedColumns = new PlotStackedColumnItems(layout, style, seriesGroups, columnGroups)
        this.bars = new PlotBarItems(layout, style, seriesGroups)
        this.lines = new PlotLineItems(layout, style)
    }

    getItems() {
        const stacks = new Map<string, number>()

        return this.allSeries.flatMap(series => {
            if (this.seriesGroups.isDisabled(series) && !GHOST_TYPES.includes(series.type))
                return []

            return [this.getSeriesItems(series, stacks)]
        })
    }

    private getSeriesItems(series: PlotSeries, stacks: Map<string, number>): QueueAction {
        switch (series.type) {
            case PlotType.Column:
                return this.columns.getItems(series)

            case PlotType.Line:
            case PlotType.Area:
                return this.lines.getItems(series)

            case PlotType.Bar:
                return this.bars.getItems(series)

            case PlotType.StackingColumn:
                return this.stackedColumns.getItems(series, stacks)

            case PlotType.AttentionLine:
                return this.lines.getAttentionItems(series)

            default:
                return QueueItemsBuilder.empty
        }
    }
}