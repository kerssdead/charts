import CellsHover from '@/helpers/CellsHover'
import { AnimationTiming } from '@/static/constants/Index'

describe('Getting the version of cells hover', () => {
    it('Should start at zero', () => {
        expect(new CellsHover().version)
            .toBe(0)
    })

    it('Should change when a cell dims', () => {
        const hover = new CellsHover()

        hover.step(1, 0)
        hover.step(1, AnimationTiming.hover / 2)

        expect(hover.version)
            .toBeGreaterThan(0)
    })

    it('Should stay the same when nothing changes', () => {
        const hover = new CellsHover()

        hover.step(1, 0, true)

        const { version } = hover

        hover.step(1, 100, true)

        expect(hover.version)
            .toBe(version)
    })
})