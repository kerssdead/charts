import { getLogTicksBetween } from '@/helpers/AxisTicks'

describe('Getting log ticks between values', () => {
    it('Should put powers of ten inside range', () => {
        expect(getLogTicksBetween(2, 50000))
            .toEqual([10, 100, 1000, 10000])
    })

    it('Should include range ends that are powers of ten', () => {
        expect(getLogTicksBetween(1, 100))
            .toEqual([1, 10, 100])
    })

    it('Should use range ends when less than two powers fit', () => {
        expect(getLogTicksBetween(2, 50))
            .toEqual([2, 50])
    })
})