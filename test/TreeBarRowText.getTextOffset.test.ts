import { getTextOffset } from '@/render/treeBar/TreeBarRowText'
import TreeBarRow from '@/types/TreeBarRow'

describe('Getting tree bar text offset', () => {
    it('Should leave space for toggle', () => {
        expect(getTextOffset(new TreeBarRow({ label: 'Lorem' })))
            .toBe(16)
    })

    it('Should leave space for toggle and image', () => {
        expect(getTextOffset(new TreeBarRow({ label: 'Lorem', image: 'lorem.png' })))
            .toBe(16 + 24 + 8)
    })
})