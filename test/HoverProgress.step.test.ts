import HoverProgress from '@/types/HoverProgress'

describe('Stepping hover progress', () => {
    it('Should not change on first step', () => {
        const hover = new HoverProgress()

        expect(hover.step(true, 0, 100))
            .toBe(false)
        expect(hover.isAnimating)
            .toBe(true)
    })

    it('Should grow while hovered and stop at 1', () => {
        const hover = new HoverProgress()

        hover.step(true, 0, 100)

        expect(hover.step(true, 50, 100))
            .toBe(true)
        expect(hover.value)
            .toBeGreaterThan(0)

        hover.step(true, 200, 100)

        expect(hover.value)
            .toBe(1)
        expect(hover.isAnimating)
            .toBe(false)
        expect(hover.step(true, 300, 100))
            .toBe(false)
    })

    it('Should fade out and reset time when idle', () => {
        const hover = new HoverProgress()

        hover.step(true, 0, 100)
        hover.step(true, 100, 100)
        hover.step(false, 200, 100)

        expect(hover.isIdle)
            .toBe(true)

        hover.step(true, 1000, 100)

        expect(hover.isIdle)
            .toBe(true)
    })
})