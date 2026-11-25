import HeatMapDefinition from '@/charts/HeatMapDefinition'
import HeatMapData from '@/types/data/HeatMapData'

describe('Applying the own color of a heat map', () => {
    it('Should take the base color when the data has none', () => {
        const data = { values: [] } as unknown as HeatMapData

        HeatMapDefinition.applyOwnColors?.(data, '#112233')

        expect(data.color)
            .toBe('#112233')
    })

    it('Should keep the color of the data', () => {
        const data = { values: [], color: '#abcdef' } as unknown as HeatMapData

        HeatMapDefinition.applyOwnColors?.(data, '#112233')

        expect(data.color)
            .toBe('#abcdef')
    })
})