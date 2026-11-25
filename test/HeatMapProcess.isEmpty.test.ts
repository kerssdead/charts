import HeatMapProcess from '@/render/heatMap/HeatMapProcess'
import HeatMapData from '@/types/data/HeatMapData'
import { LIGHT_THEME } from '@/Theme'
import { createState } from './ViewStateTestData'
import { labeled } from './HeatMapTestData'

const isEmpty = (data: HeatMapData) => {
    const settings = { valuePostfix: undefined, theme: LIGHT_THEME }

    return new HeatMapProcess(data, { x: 5, y: 5 }, settings, createState(data)).isEmpty()
}

describe('Checking the heat map is empty', () => {
    it('Should be empty without values', () => {
        expect(isEmpty(labeled([])))
            .toBe(true)
    })

    it('Should not be empty with a value', () => {
        expect(isEmpty(labeled([['a', 'x', 1]])))
            .toBe(false)
    })

    it('Should not be empty when the only value is zero', () => {
        expect(isEmpty(labeled([['a', 'x', 0]])))
            .toBe(false)
    })
})