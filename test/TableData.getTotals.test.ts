import { getTotals } from '@/types/TableData'

describe('Getting table totals', () => {
    it('Should sum each column', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }, { value: 'b', display: 'B' }],
            values: [
                { name: 'One', values: new Map([['a', 1], ['b', 10]]) },
                { name: 'Two', values: new Map([['a', 2], ['b', 20]]) }
            ]
        }

        expect(getTotals(table))
            .toEqual([3, 30])
    })

    it('Should treat missing values as zero', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }],
            values: [{ name: 'One', values: new Map([['a', 5]]) }, { name: 'Two', values: new Map() }]
        }

        expect(getTotals(table))
            .toEqual([5])
    })

    it('Should sum only top level rows', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }],
            values: [
                { name: 'Parent', values: new Map([['a', 10]]) },
                { name: 'Child', level: 1, values: new Map([['a', 4]]) },
                { name: 'Other', values: new Map([['a', 5]]) }
            ]
        }

        expect(getTotals(table))
            .toEqual([15])
    })
})