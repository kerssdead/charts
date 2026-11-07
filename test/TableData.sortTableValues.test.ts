import { sortTableValues } from '@/types/TableData'
import TableValue from '@/types/TableValue'
import { SortDirection } from '@/static/Enums'

const row = (name: string, amount: number, level?: number): TableValue => {
    return { name, level, values: new Map([['amount', amount]]) }
}

const names = (values: TableValue[]) => values.map(value => value.name)

describe('Sorting table values', () => {
    it('Should keep the original array without direction', () => {
        const values = [row('b', 1), row('a', 2)]

        expect(sortTableValues(values, 'amount', SortDirection.None))
            .toBe(values)
    })

    it('Should sort by column ascending', () => {
        expect(names(sortTableValues([row('a', 3), row('b', 1), row('c', 2)], 'amount', SortDirection.Ascending)))
            .toEqual(['b', 'c', 'a'])
    })

    it('Should sort by column descending', () => {
        expect(names(sortTableValues([row('a', 3), row('b', 1), row('c', 2)], 'amount', SortDirection.Descending)))
            .toEqual(['a', 'c', 'b'])
    })

    it('Should put a missing column value last in ascending order', () => {
        const values = [row('a', 5), { name: 'b', values: new Map() }, row('c', -1)]

        expect(names(sortTableValues(values, 'amount', SortDirection.Ascending)))
            .toEqual(['c', 'a', 'b'])
    })

    it('Should put a missing column value last in descending order', () => {
        const values = [{ name: 'b', values: new Map() }, row('a', 5), row('c', -1)]

        expect(names(sortTableValues(values, 'amount', SortDirection.Descending)))
            .toEqual(['a', 'c', 'b'])
    })

    it('Should sort names naturally without column', () => {
        const values = [row('Item 10', 0), row('Item 2', 0), row('Item 1', 0)]

        expect(names(sortTableValues(values, undefined, SortDirection.Ascending)))
            .toEqual(['Item 1', 'Item 2', 'Item 10'])
    })

    it('Should not mutate the original array', () => {
        const values = [row('a', 2), row('b', 1)]

        sortTableValues(values, 'amount', SortDirection.Ascending)

        expect(names(values))
            .toEqual(['a', 'b'])
    })

    it('Should keep children under their parent and sort siblings', () => {
        const values = [
            row('A', 1),
            row('A2', 5, 1),
            row('A1', 2, 1),
            row('B', 9),
            row('B1', 1, 1),
            row('B1b', 3, 2),
            row('B1a', 1, 2)
        ]

        expect(names(sortTableValues(values, 'amount', SortDirection.Descending)))
            .toEqual(['B', 'B1', 'B1b', 'B1a', 'A', 'A2', 'A1'])
    })
})