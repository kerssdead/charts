import ChartDefinition from '@/charts/ChartDefinition'
import TreeMapProcess from '@/render/tree/TreeMapProcess'
import TreeData, { getTreeSum } from '@/types/data/TreeData'
import { prepareSectors } from '@/helpers/ValuePreparation'
import { normalizeTreeValues } from '@/helpers/ValueNormalization'
import { mergeTreeValues } from '@/helpers/ValueMerging'
import { getValueRows } from '@/export/TableRows'
import { withShares } from '@/export/TableTotals'
import TextResources from '@/static/TextResources'

const TreeMapDefinition: ChartDefinition<TreeData> = {
    createProcess: (data, pixel, settings) => new TreeMapProcess(data, pixel, settings),
    prepareData: prepareSectors,
    normalizeData: normalizeTreeValues,
    mergeSameLabelValues: mergeTreeValues,
    getPaletteValues: data => data.values ?? [],
    getTableRows: data => getValueRows(data.values, getTreeSum),
    summarizeTable: table => withShares(table, TextResources.value),
    hasLegend: data => (data?.values?.length ?? 0) > 1,
    hasMenu: true,
    hasFixedHeader: false
}

export default TreeMapDefinition