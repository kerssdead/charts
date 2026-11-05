import { getLogAxisValues } from '@/helpers/AxisTicks'

describe('Getting log axis values', () => {
    it('Should cover values with powers of ten', () => {
        expect(getLogAxisValues([3, 700]))
            .toEqual([1, 10, 100, 1000])
    })

    it('Should end at max', () => {
        expect(getLogAxisValues([3, 700], 500))
            .toEqual([1, 10, 100, 500])
        expect(getLogAxisValues([3, 700], 50))
            .toEqual([1, 10, 50])
    })

    it('Should ignore values that are not positive', () => {
        expect(getLogAxisValues([-5, 0, 50]))
            .toEqual([10, 100])
    })

    it('Should return nothing without positive values', () => {
        expect(getLogAxisValues([-5, 0]))
            .toEqual([])
        expect(getLogAxisValues([]))
            .toEqual([])
    })

    it('Should add lower power for a single power of ten', () => {
        expect(getLogAxisValues([100, 100]))
            .toEqual([10, 100])
    })

    it('Should skip powers for wide range', () => {
        expect(getLogAxisValues([1e-3, 1e12]))
            .toEqual([1e-3, 1e-1, 1e1, 1e3, 1e5, 1e7, 1e9, 1e11, 1e12])
    })
})