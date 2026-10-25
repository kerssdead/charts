import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'

jest.mock('@/Theme', () => ({ text: '#000000', lineAxis: '#e0e0e0' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string, font: number = 14) => text.length * font / 2
}))

const create = (values: TreeBarRow[]) =>
    new TreeBarProcess({ values } as TreeBarData, { x: 5, y: 12.5 }, { valuePostfix: undefined })

describe('Checking tree bar emptiness', () => {
    it('Should be empty without rows', () => {
        expect(create([]).isEmpty())
            .toBe(true)
    })

    it('Should not be empty with row', () => {
        expect(create([new TreeBarRow({ id: 'a', label: 'a', parts: [] })]).isEmpty())
            .toBe(false)
    })
})