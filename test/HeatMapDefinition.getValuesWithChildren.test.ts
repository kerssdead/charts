import HeatMapDefinition from '@/charts/HeatMapDefinition'
import HeatMapData from '@/types/data/HeatMapData'
import { labeled } from './HeatMapTestData'

describe('Getting heat map values with children', () => {
    it('Should give no values, so cells are not tracked by the view state', () => {
        expect(HeatMapDefinition.getValuesWithChildren?.(labeled([['a', 'p', 1]])))
            .toEqual([])
    })

    it('Should give no palette values', () => {
        expect(HeatMapDefinition.getPaletteValues({ values: [] } as unknown as HeatMapData))
            .toEqual([])
    })
})