import ChartDefinition from '@/charts/ChartDefinition'
import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import TreeBarData, { applyTreeBarViewState, colorTreeBarRows, getAllTreeBarRows } from '@/types/data/TreeBarData'
import { prepareTreeBarRows } from '@/helpers/ValuePreparation'
import { normalizeTreeBarRows } from '@/helpers/ValueNormalization'
import { getTreeBarRows } from '@/export/TableRows'

const TreeBarDefinition: ChartDefinition<TreeBarData> = {
    createProcess: (data, pixel, settings, state) => new TreeBarProcess(data, pixel, settings, state),
    prepareData: prepareTreeBarRows,
    normalizeData: (data, numberLocale, scope) => normalizeTreeBarRows(data.values, numberLocale, scope),
    applyViewState: applyTreeBarViewState,
    getValuesWithChildren: data => getAllTreeBarRows(data.values),
    getPaletteValues: () => [],
    applyOwnColors: (data, baseColor) => colorTreeBarRows(data.values, baseColor),
    getTableRows: getTreeBarRows,
    hasLegend: () => false,
    hasMenu: true,
    hasFixedHeader: true
}

export default TreeBarDefinition