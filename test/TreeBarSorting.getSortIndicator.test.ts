import { getSortIndicator } from '@/render/treeBar/TreeBarSorting'

describe('Getting tree bar sort indicator', () => {
    it('Should be empty for not sorted column', () => {
        expect(getSortIndicator('amount', 'code', false))
            .toBe('')
        expect(getSortIndicator('amount', undefined, undefined))
            .toBe('')
    })

    it('Should show sort direction for sorted column', () => {
        expect([getSortIndicator('amount', 'amount', false), getSortIndicator('amount', 'amount', true)])
            .toEqual([' ▲', ' ▼'])
    })
})