import PlotData from '@/types/data/PlotData'
import PlotSeries from '@/types/PlotSeries'
import Units from '@/helpers/Units'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { PlotType } from '@/static/Enums'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotItemStyle from '@/render/plot/PlotItemStyle'

export const UNITS = new Units({ x: 1, y: 1 })

export function createSeries(type: PlotType, ys: number[], extra: Partial<PlotSeries> = {}) {
    return {
        type,
        label: `Series ${ type }`,
        color: '#ff0000',
        width: 2,
        dash: [],
        values: ys.map((y, i) => ({ x: `C${ i }`, y })),
        ...extra
    } as PlotSeries
}

export function createPlot(values: PlotSeries[], data: Partial<PlotData> = {}) {
    const plotData = { values, ...data } as PlotData
    const seriesGroups = new PlotSeriesGroups(values)
    const layout = new PlotLayout(plotData, UNITS, seriesGroups)
    const style = new PlotItemStyle(layout, seriesGroups, (series, value) => `${ series.label }: ${ value.y }`)

    return { data: plotData, seriesGroups, layout, style }
}

export function buildItems(actions: QueueAction | QueueAction[]) {
    return QueueItemsBuilder.build(actions)
}