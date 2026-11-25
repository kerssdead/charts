import { getPointsExtent } from '@/render/heatMap/HeatMapGrid'
import HeatMapCell from '@/types/HeatMapCell'

describe('Getting the extent of points', () => {
    it('Should reach the farthest point', () => {
        expect(getPointsExtent([new HeatMapCell({ x: 30, y: 5 }), new HeatMapCell({ x: 10, y: 80 })]))
            .toEqual({ width: 30, height: 80 })
    })

    it('Should be at least one unit wide and high', () => {
        expect(getPointsExtent([new HeatMapCell({ x: 0, y: 0 })]))
            .toEqual({ width: 1, height: 1 })
    })

    it('Should read coordinates given as strings', () => {
        expect(getPointsExtent([new HeatMapCell({ x: '12', y: '7' })]))
            .toEqual({ width: 12, height: 7 })
    })
})