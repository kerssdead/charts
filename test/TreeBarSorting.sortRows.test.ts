import { sortRows } from '@/render/treeBar/TreeBarSorting'
import TreeBarRow from '@/types/TreeBarRow'

const row = (id: string, value?: string | number) =>
    new TreeBarRow({ id, label: id, cells: value == undefined ? {} : { amount: value } })

const ids = (rows: TreeBarRow[]) => rows.map(row => row.id)

describe('Sorting tree bar rows', () => {
    it('Should keep order without sort column', () => {
        const rows = [row('a', 2), row('b', 1)]

        expect(sortRows(rows, undefined, false))
            .toBe(rows)
    })

    it('Should sort numbers and numeric strings by value', () => {
        expect(ids(sortRows([row('a', '1,000'), row('b', 5), row('c', 20)], 'amount', false)))
            .toEqual(['b', 'c', 'a'])
    })

    it('Should sort descending', () => {
        expect(ids(sortRows([row('a', 1), row('b', 3), row('c', 2)], 'amount', true)))
            .toEqual(['b', 'c', 'a'])
    })

    it('Should sort text naturally', () => {
        expect(ids(sortRows([row('a', 'Item 10'), row('b', 'Item 2')], 'amount', false)))
            .toEqual(['b', 'a'])
    })

    it('Should keep missing values last in both directions', () => {
        const rows = [row('a'), row('b', ''), row('c', 1), row('d', 2)]

        expect(ids(sortRows(rows, 'amount', false)))
            .toEqual(['c', 'd', 'a', 'b'])
        expect(ids(sortRows(rows, 'amount', true)))
            .toEqual(['d', 'c', 'a', 'b'])
    })

    it('Should not change source rows', () => {
        const rows = [row('a', 2), row('b', 1)]

        sortRows(rows, 'amount', false)

        expect(ids(rows))
            .toEqual(['a', 'b'])
    })
})