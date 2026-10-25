import { getRowHeight } from '@/render/treeBar/TreeBarRowText'
import TreeBarRow from '@/types/TreeBarRow'

describe('Getting tree bar row height', () => {
    it('Should use min height for short label', () => {
        expect(getRowHeight(new TreeBarRow({ label: 'Lorem' })))
            .toBe(36)
    })

    it('Should grow with lines and padding', () => {
        expect(getRowHeight(new TreeBarRow({ label: 'Lorem\nIpsum', subLabel: 'Dolor' })))
            .toBe(15 * 3 + 6 * 2)
    })
})