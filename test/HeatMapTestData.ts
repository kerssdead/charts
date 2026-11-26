import HeatMapData from '@/types/data/HeatMapData'
import { normalizeHeatMap } from '@/helpers/ValueNormalization'
import { prepareHeatMapCells } from '@/helpers/ValuePreparation'

export function heatMapData(fields: Omit<Partial<HeatMapData>, 'values'> & { values: object[] }) {
    const data = { color: '#d62728', ...fields } as HeatMapData

    prepareHeatMapCells(data)
    normalizeHeatMap(data, undefined)

    return data
}

export const labeled = (cells: [string, string, number][], extra: Partial<HeatMapData> = {}) => {
    return heatMapData({ values: cells.map(([x, y, value]) => ({ x, y, value })), ...extra })
}

export const points = (list: [number, number, number][], extra: Partial<HeatMapData> = {}) => {
    return heatMapData({ values: list.map(([x, y, value]) => ({ x, y, value })), resolution: 10, ...extra })
}