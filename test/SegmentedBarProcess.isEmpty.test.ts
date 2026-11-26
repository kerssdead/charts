import { LIGHT_THEME } from '@/Theme'

import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import { createState } from './ViewStateTestData'

const create = (values: Sector[], stops: SegmentedBarStop[]) => {
    return new SegmentedBarProcess(
        { values, stops } as SegmentedBarData,
        { x: 5, y: 125 },
        { valuePostfix: undefined, theme: LIGHT_THEME },
        { state: createState({ values }) }
    )
}

describe('Checking segmented bar emptiness', () => {
    it('Should be empty without positive parts and stops', () => {
        expect(create([], []).isEmpty())
            .toBe(true)
        expect(create([new Sector({ id: 'a', value: 0 })], []).isEmpty())
            .toBe(true)
    })

    it('Should not be empty with positive part', () => {
        expect(create([new Sector({ id: 'a', value: 1 })], []).isEmpty())
            .toBe(false)
    })

    it('Should not be empty with stop only', () => {
        expect(create([], [new SegmentedBarStop({ id: 'b', value: 1 })]).isEmpty())
            .toBe(false)
    })
})