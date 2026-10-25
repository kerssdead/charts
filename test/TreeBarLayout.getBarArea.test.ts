import { getBarArea } from '@/render/treeBar/TreeBarLayout'

const COLUMN = { key: 'amount', title: 'Amount', left: 800, right: 900, width: 100 }

describe('Getting tree bar area', () => {
    it('Should span from names to content right minus bar label', () => {
        expect(getBarArea(100, [], 980, 30))
            .toEqual({ x: 8 + 100 + 16, width: 980 - 30 - 124 })
    })

    it('Should end before first column', () => {
        expect(getBarArea(100, [COLUMN], 980, 0))
            .toEqual({ x: 124, width: 800 - 16 - 124 })
    })

    it('Should not have negative width', () => {
        expect(getBarArea(950, [], 980, 30).width)
            .toBe(0)
    })
})