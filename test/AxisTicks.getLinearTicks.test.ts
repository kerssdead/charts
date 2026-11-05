import { getLinearTicks } from '@/helpers/AxisTicks'

describe('Getting linear ticks', () => {
    it('Should put nice ticks inside range', () => {
        expect(getLinearTicks(3, 97, 10))
            .toEqual([20, 40, 60, 80])
    })

    it('Should include range ends on step', () => {
        expect(getLinearTicks(0, 1, 11))
            .toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
    })

    it('Should cover negative range', () => {
        expect(getLinearTicks(-45, 45, 10))
            .toEqual([-40, -30, -20, -10, 0, 10, 20, 30, 40])
    })

    it('Should return min for empty range', () => {
        expect(getLinearTicks(5, 5, 10))
            .toEqual([5])
        expect(getLinearTicks(5, 1, 10))
            .toEqual([5])
    })
})