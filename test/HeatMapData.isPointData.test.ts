import HeatMapData, { isPointData } from '@/types/data/HeatMapData'

describe('Checking data is made of points', () => {
    it('Should treat data without a resolution as labeled cells', () => {
        expect(isPointData({} as HeatMapData))
            .toBe(false)
    })

    it('Should treat data with a numeric resolution as points', () => {
        expect(isPointData({ resolution: 40 } as HeatMapData))
            .toBe(true)
    })

    it('Should treat data with columns and rows as points', () => {
        expect(isPointData({ resolution: { columns: 10, rows: 5 } } as HeatMapData))
            .toBe(true)
    })
})