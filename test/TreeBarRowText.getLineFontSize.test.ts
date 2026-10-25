import { getLineFontSize } from '@/render/treeBar/TreeBarRowText'

describe('Getting tree bar line font size', () => {
    it('Should use smaller font for sub label', () => {
        expect([getLineFontSize({ text: 'Lorem', isSubLabel: false }), getLineFontSize({ text: 'Dolor', isSubLabel: true })])
            .toEqual([12, 11])
    })
})