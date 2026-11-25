import HeatMapDefinition from '@/charts/HeatMapDefinition'
import HeatMapData from '@/types/data/HeatMapData'
import { labeled } from './HeatMapTestData'

describe('Heat map chart definition', () => {
    it('Should not have a legend of items, even with many cells', () => {
        expect(HeatMapDefinition.hasLegend(labeled([['a', 'p', 1], ['b', 'p', 2]])))
            .toBe(false)
        expect(HeatMapDefinition.hasLegend({} as HeatMapData))
            .toBe(false)
    })

    it('Should have a menu and no fixed header', () => {
        expect(HeatMapDefinition.hasMenu)
            .toBe(true)
        expect(HeatMapDefinition.hasFixedHeader)
            .toBe(false)
    })
})