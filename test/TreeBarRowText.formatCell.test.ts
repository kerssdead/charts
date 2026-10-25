import { formatCell } from '@/render/treeBar/TreeBarRowText'

describe('Formatting tree bar cell', () => {
    it('Should format number in full form', () => {
        expect(formatCell(1234.5))
            .toBe((1234.5).toLocaleString(undefined, { maximumFractionDigits: 2 }))
    })

    it('Should keep string as is', () => {
        expect(formatCell('1.2K'))
            .toBe('1.2K')
    })

    it('Should show missing value as empty', () => {
        expect(formatCell(undefined))
            .toBe('')
    })
})