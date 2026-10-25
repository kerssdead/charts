import { getPositiveSortedDescending } from '@/render/tree/TreeMapLayout'

describe('Getting positive tree values sorted descending', () => {
    it('Should drop zero and negative values', () => {
        expect(getPositiveSortedDescending([3, 0, -2, 1], value => value))
            .toEqual([3, 1])
    })

    it('Should sort by value descending', () => {
        const values = [{ value: 1 }, { value: 5 }, { value: 3 }]

        expect(getPositiveSortedDescending(values, item => item.value))
            .toEqual([{ value: 5 }, { value: 3 }, { value: 1 }])
    })

    it('Should not change input array', () => {
        const values = [1, 3, 2]

        getPositiveSortedDescending(values, value => value)

        expect(values)
            .toEqual([1, 3, 2])
    })
})