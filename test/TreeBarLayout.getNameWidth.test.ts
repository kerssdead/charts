import { getNameWidth } from '@/render/treeBar/TreeBarLayout'
import TreeBarRow from '@/types/TreeBarRow'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string, font: number = 14) => text.length * font / 2
}))

const entry = (level: number, extra: Partial<TreeBarRow>) => ({ node: new TreeBarRow({ label: '', ...extra }), level })

describe('Getting tree bar name width', () => {
    it('Should fit widest label with indent and toggle', () => {
        const entries = [
            entry(0, { label: 'Lorem' }),
            entry(2, { label: 'a'.repeat(40) }),
            entry(0, { label: 'Lorem', subLabel: 'a'.repeat(30) })
        ]

        expect(getNameWidth(entries, 1000))
            .toBe(2 * 16 + 16 + 40 * 6)
    })

    it('Should include image space', () => {
        expect(getNameWidth([entry(0, { label: 'a'.repeat(20), image: 'lorem.png' })], 1000))
            .toBe(16 + 24 + 8 + 20 * 6)
    })

    it('Should keep min width for short labels', () => {
        expect(getNameWidth([entry(0, { label: 'Lo' })], 1000))
            .toBe(80)
    })

    it('Should limit width by chart share', () => {
        expect(getNameWidth([entry(0, { label: 'a'.repeat(100) })], 1000))
            .toBe(350)
        expect(getNameWidth([entry(0, { label: 'Lo' })], 100))
            .toBe(35)
    })
})