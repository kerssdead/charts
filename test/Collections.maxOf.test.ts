import { maxOf } from '@/helpers/Collections'

describe('Finding maximum value', () => {
    it('Should return the largest selected value', () => {
        expect(maxOf([{ value: 1 }, { value: 7 }, { value: 3 }], item => item.value))
            .toBe(7)
    })

    it('Should return the largest value of an all-negative array', () => {
        expect(maxOf([{ value: -5 }, { value: -2 }, { value: -9 }], item => item.value))
            .toBe(-2)
    })

    it('Should return -Infinity for empty array', () => {
        expect(maxOf([], () => 1))
            .toBe(-Infinity)
    })
})