import ChartDefinition from '@/charts/ChartDefinition'
import GaugeProcess from '@/render/gauge/GaugeProcess'
import GaugeData from '@/types/data/GaugeData'
import { prepareSectors } from '@/helpers/ValuePreparation'
import { normalizeValues } from '@/helpers/ValueNormalization'
import { mergeSectors } from '@/helpers/ValueMerging'
import { getValueRows } from '@/export/TableRows'

const GaugeDefinition: ChartDefinition<GaugeData> = {
    createProcess: (data, pixel, settings) => new GaugeProcess(data, pixel, settings),
    prepareData: prepareSectors,
    normalizeData: (data, numberLocale, scope) => normalizeValues(data.values, numberLocale, scope),
    mergeSameLabelValues: mergeSectors,
    getPaletteValues: data => data.values ?? [],
    getTableRows: data => getValueRows(data.values),
    hasLegend: () => false,
    hasMenu: true,
    hasFixedHeader: false
}

export default GaugeDefinition