import { flattenTreeBarRows, getAllTreeBarRows } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'

describe('Getting all tree bar rows', () => {
    it('Should list rows depth first including collapsed children', () => {
        const rows = [
            new TreeBarRow({ id: 'a', children: [new TreeBarRow({ id: 'a1', children: [new TreeBarRow({ id: 'a2' })] })] }),
            new TreeBarRow({ id: 'b' })
        ]

        expect(getAllTreeBarRows(rows).map(row => row.id))
            .toEqual(['a', 'a1', 'a2', 'b'])
    })

    it('Should get no rows without values', () => {
        expect(getAllTreeBarRows(undefined))
            .toEqual([])
    })

    it('Should skip children of rows that are not open', () => {
        const rows = [new TreeBarRow({ id: 'a', children: [new TreeBarRow({ id: 'a1' })] })]

        expect(flattenTreeBarRows(rows, () => false).map(({ node }) => node.id))
            .toEqual(['a'])
    })
})