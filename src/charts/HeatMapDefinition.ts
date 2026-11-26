import ChartDefinition from '@/charts/ChartDefinition'
import HeatMapProcess from '@/render/heatMap/HeatMapProcess'
import HeatMapData from '@/types/data/HeatMapData'
import { prepareHeatMapCells } from '@/helpers/ValuePreparation'
import { normalizeHeatMap } from '@/helpers/ValueNormalization'
import { getHeatMapRows } from '@/export/TableRows'

const HeatMapDefinition: ChartDefinition<HeatMapData> = {
    createProcess: (data, pixel, settings, context) => new HeatMapProcess(data, pixel, settings, context),
    prepareData: prepareHeatMapCells,
    normalizeData: normalizeHeatMap,
    applyOwnColors: (data, baseColor) => {
        data.color ||= baseColor
    },
    getPaletteValues: () => [],
    getValuesWithChildren: () => [],
    getTableRows: getHeatMapRows,
    hasLegend: () => false,
    hasMenu: true,
    hasFixedHeader: false
}

export default HeatMapDefinition