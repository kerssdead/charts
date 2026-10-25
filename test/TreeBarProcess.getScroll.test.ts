import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'

jest.mock('@/Theme', () => ({ text: '#000000', lineAxis: '#e0e0e0' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string, font: number = 14) => text.length * font / 2
}))

const row = (id: string, extra: Partial<TreeBarRow> = {}) => new TreeBarRow({ id, label: id, parts: [], ...extra })

const getScroll = (values: TreeBarRow[]) =>
    new TreeBarProcess({ values } as TreeBarData, { x: 5, y: 12.5 }, { valuePostfix: undefined }).getScroll()

describe('Getting tree bar scroll', () => {
    it('Should start below header without rows', () => {
        expect(getScroll([]))
            .toEqual({ top: 32, height: 32 })
    })

    it('Should sum heights of visible rows', () => {
        const values = [
            row('a', { expanded: true, children: [row('b', { label: 'Lorem\nIpsum', subLabel: 'Dolor' })] }),
            row('c', { children: [row('d')] })
        ]

        expect(getScroll(values))
            .toEqual({ top: 32, height: 32 + 36 + 57 + 36 })
    })
})