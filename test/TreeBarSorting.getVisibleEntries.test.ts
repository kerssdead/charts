import { getVisibleEntries } from '@/render/treeBar/TreeBarSorting'
import TreeBarRow from '@/types/TreeBarRow'

const row = (id: string, amount: number, extra: Partial<TreeBarRow> = {}) => {
    return new TreeBarRow({ id, label: id, cells: { amount }, ...extra })
}

const entries = (rows: TreeBarRow[], sortColumn?: string) => {
    return getVisibleEntries(rows, sortColumn, false).map(({ node, level }) => [node.id, level])
}

describe('Getting visible tree bar entries', () => {
    it('Should hide children of collapsed rows', () => {
        expect(entries([row('a', 1, { children: [row('b', 1)] }), row('c', 1)]))
            .toEqual([['a', 0], ['c', 0]])
    })

    it('Should show children of expanded rows with next level', () => {
        const rows = [row('a', 1, { expanded: true, children: [row('b', 1, { expanded: true, children: [row('c', 1)] })] })]

        expect(entries(rows))
            .toEqual([['a', 0], ['b', 1], ['c', 2]])
    })

    it('Should sort siblings on every level', () => {
        const rows = [
            row('a', 2, { expanded: true, children: [row('a1', 2), row('a2', 1)] }),
            row('b', 1)
        ]

        expect(entries(rows, 'amount'))
            .toEqual([['b', 0], ['a', 0], ['a2', 1], ['a1', 1]])
    })

    it('Should sort children with number locale', () => {
        const child = (id: string, amount: string) => new TreeBarRow({ id, label: id, cells: { amount } })
        const rows = [row('a', 1, { expanded: true, children: [child('a1', '1.500'), child('a2', '20')] })]

        expect(getVisibleEntries(rows, 'amount', false, 'de-DE').map(({ node }) => node.id))
            .toEqual(['a', 'a2', 'a1'])
    })
})