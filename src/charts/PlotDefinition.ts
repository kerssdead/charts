import ChartDefinition from '@/charts/ChartDefinition'
import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { prepareSeries } from '@/helpers/ValuePreparation'
import { normalizeSeries } from '@/helpers/ValueNormalization'
import { mergeSeries } from '@/helpers/ValueMerging'
import { getPlotRows } from '@/export/TableRows'
import { withRowTotals } from '@/export/TableTotals'

const PlotDefinition: ChartDefinition<PlotData> = {
    createProcess: (data, pixel, settings, state) => new PlotProcess(data, pixel, settings, state),
    prepareData: prepareSeries,
    normalizeData: normalizeSeries,
    mergeSameLabelValues: mergeSeries,
    getPaletteValues: data => data.values ?? [],
    getTableRows: getPlotRows,
    summarizeTable: withRowTotals,
    hasLegend: () => true,
    hasMenu: true,
    hasFixedHeader: false
}

export default PlotDefinition