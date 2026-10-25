import { getLines } from '@/render/treeBar/TreeBarRowText'
import TreeBarRow from '@/types/TreeBarRow'

describe('Getting tree bar row lines', () => {
    it('Should split label by line breaks', () => {
        expect(getLines(new TreeBarRow({ label: 'Lorem\nIpsum' })))
            .toEqual([{ text: 'Lorem', isSubLabel: false }, { text: 'Ipsum', isSubLabel: false }])
    })

    it('Should add sub label as last line', () => {
        expect(getLines(new TreeBarRow({ label: 'Lorem', subLabel: 'Dolor' })))
            .toEqual([{ text: 'Lorem', isSubLabel: false }, { text: 'Dolor', isSubLabel: true }])
    })
})