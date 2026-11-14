import ChartDefinition from '@/charts/ChartDefinition'
import PieProcess from '@/render/pie/PieProcess'
import PieData from '@/types/data/PieData'
import { prepareSectors } from '@/helpers/ValuePreparation'
import { normalizeValues } from '@/helpers/ValueNormalization'
import { mergeSectors } from '@/helpers/ValueMerging'
import { getValueRows } from '@/export/TableRows'
import { withShares } from '@/export/TableTotals'
import TextResources from '@/static/TextResources'

const PieDefinition: ChartDefinition<PieData> = {
    createProcess: (data, pixel, settings, state) => new PieProcess(data, pixel, settings, state),
    prepareData: prepareSectors,
    normalizeData: (data, numberLocale, scope) => normalizeValues(data.values, numberLocale, scope),
    mergeSameLabelValues: mergeSectors,
    applyViewState: (data, state) => state.applyPinned(data.values ?? []),
    getPaletteValues: data => data.values ?? [],
    getTableRows: (data, isDisabled) => getValueRows(data.values, isDisabled),
    summarizeTable: table => withShares(table, TextResources.value),
    hasLegend: () => true,
    hasMenu: true,
    hasFixedHeader: false
}

export default PieDefinition