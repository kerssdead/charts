import CellsHover from '@/helpers/CellsHover'
import { AnimationTiming } from '@/static/constants/Index'

describe('Stepping the hover of cells', () => {
    it('Should animate while a cell is being hovered', () => {
        const hover = new CellsHover()

        expect(hover.step(1, 0))
            .toBe(true)
        expect(hover.step(1, AnimationTiming.hover / 2))
            .toBe(true)
    })

    it('Should stop once the hovered cell is fully dimmed', () => {
        const hover = new CellsHover()

        hover.step(1, 0)
        hover.step(1, AnimationTiming.hover)

        expect(hover.step(1, AnimationTiming.hover * 2))
            .toBe(false)
    })

    it('Should report nothing without a hovered cell', () => {
        expect(new CellsHover().step(null, 0))
            .toBe(false)
    })

    it('Should bring back a cell the pointer has left', () => {
        const hover = new CellsHover()

        hover.step(1, 0)
        hover.step(1, AnimationTiming.hover)

        expect(hover.step(null, AnimationTiming.hover * 1.5))
            .toBe(true)
        expect(hover.getAlpha(1))
            .toBeLessThan(1)

        hover.step(null, AnimationTiming.hover * 3)

        expect(hover.getAlpha(1))
            .toBe(1)
    })

    it('Should bring back the previous cell while dimming the next one', () => {
        const hover = new CellsHover()

        hover.step(1, 0)
        hover.step(1, AnimationTiming.hover)
        hover.step(2, AnimationTiming.hover)
        hover.step(2, AnimationTiming.hover * 1.5)

        expect(hover.getAlpha(1))
            .toBeGreaterThan(.5)
        expect(hover.getAlpha(1))
            .toBeLessThan(1)
        expect(hover.getAlpha(2))
            .toBeLessThan(1)
    })

    it('Should switch cells straight away when instant', () => {
        const hover = new CellsHover()

        hover.step(1, 0, true)
        hover.step(2, 0, true)

        expect([hover.getAlpha(1), hover.getAlpha(2)])
            .toEqual([1, .5])
    })
})