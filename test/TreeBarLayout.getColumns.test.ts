import { getColumns } from '@/render/treeBar/TreeBarLayout'
import TreeBarRow from '@/types/TreeBarRow'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string, font: number = 14) => text.length * font / 2
}))

const COLUMNS = [{ key: 'name', title: 'Ab' }, { key: 'code', title: 'Ab' }]

const ENTRIES = [{ node: new TreeBarRow({ label: 'a', cells: { name: 'Lorem ipsum', code: 'XY' } }), level: 0 }]

describe('Getting tree bar columns', () => {
    it('Should place columns from right by widest title or cell', () => {
        expect(getColumns(COLUMNS, ENTRIES, 900, 1000))
            .toEqual([
                { key: 'name', title: 'Ab', left: 860 - 66, right: 860, width: 66 },
                { key: 'code', title: 'Ab', left: 900 - 24, right: 900, width: 24 }
            ])
    })

    it('Should limit column width by chart share', () => {
        expect(getColumns(COLUMNS, ENTRIES, 900, 300)[0].width)
            .toBe(45)
    })

    it('Should return no columns without columns', () => {
        expect(getColumns([], ENTRIES, 900, 1000))
            .toEqual([])
    })
})