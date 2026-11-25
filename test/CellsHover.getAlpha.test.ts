import CellsHover from '@/helpers/CellsHover'
import { AnimationTiming } from '@/static/constants/Index'

describe('Getting the alpha of a hovered cell', () => {
    it('Should keep cells that are not hovered opaque', () => {
        const hover = new CellsHover()

        hover.step(1, 0, true)

        expect(hover.getAlpha(2))
            .toBe(1)
    })

    it('Should dim the hovered cell by half', () => {
        const hover = new CellsHover()

        hover.step(1, 0, true)

        expect(hover.getAlpha(1))
            .toBe(.5)
    })

    it('Should dim the cell gradually', () => {
        const hover = new CellsHover()

        hover.step(1, 0)
        hover.step(1, AnimationTiming.hover / 2)

        expect(hover.getAlpha(1))
            .toBeGreaterThan(.5)
        expect(hover.getAlpha(1))
            .toBeLessThan(1)
    })
})