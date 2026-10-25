import { getFullBarValue } from '@/render/segmentedBar/SegmentedBarParts'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'

const part = (value: number) => new Sector({ value })

const stop = (value: number | string) => new SegmentedBarStop({ value })

describe('Getting segmented bar full value', () => {
    it('Should be 100 in percentage mode', () => {
        expect(getFullBarValue([part(20), part(300)], [stop(500)], true))
            .toBe(100)
    })

    it('Should be sum of parts', () => {
        expect(getFullBarValue([part(20), part(60)], [stop(500)], false))
            .toBe(80)
    })

    it('Should be largest value stop without parts', () => {
        expect(getFullBarValue([], [stop(1), stop(4), stop('80%')], false))
            .toBe(4)
    })

    it('Should be 1 without parts and positive value stops', () => {
        expect(getFullBarValue([], [], false))
            .toBe(1)
        expect(getFullBarValue([], [stop(-5), stop('50%')], false))
            .toBe(1)
    })
})