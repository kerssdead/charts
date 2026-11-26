import ChartDefinition from '@/charts/ChartDefinition'
import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import { prepareSegmentedBar } from '@/helpers/ValuePreparation'
import { normalizeSegmentedBar } from '@/helpers/ValueNormalization'
import { getValueRows } from '@/export/TableRows'

const SegmentedBarDefinition: ChartDefinition<SegmentedBarData> = {
    createProcess: (data, pixel, settings, context) => {
        return new SegmentedBarProcess(data, pixel, settings, context)
    },
    prepareData: prepareSegmentedBar,
    normalizeData: normalizeSegmentedBar,
    getPaletteValues: data => data.values ?? [],
    getUngroupedPaletteValues: data => data.stops ?? [],
    getTableRows: (data, isDisabled) => getValueRows(data.values, isDisabled),
    hasLegend: () => false,
    hasMenu: false,
    hasFixedHeader: false
}

export default SegmentedBarDefinition