import * as Helper from '@/Helper'

describe('Summing values', () => {
    it('Should sum selected values', () => {
        expect(Helper.sum([{ value: 1 }, { value: 2.5 }, { value: -4 }], item => item.value))
            .toBe(-0.5)
    })

    it('Should return 0 for empty array', () => {
        expect(Helper.sum([], () => 1))
            .toBe(0)
    })
})