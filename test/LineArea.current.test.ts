import LineArea from '@/helpers/LineArea'

const area = (baseline: number | null) => {
    const result = new LineArea()

    result.baseline = baseline

    return result
}

describe('Getting current line area baseline', () => {
    it('Should have no baseline without one', () => {
        expect(area(null).current())
            .toBeNull()
    })

    it('Should return the baseline when it did not morph', () => {
        expect(area(10).current(0.5))
            .toBe(10)
    })

    it('Should return the baseline when the previous area had none', () => {
        const next = area(10)

        next.morphFrom(area(null), 1)

        expect(next.current(0.5))
            .toBe(10)
    })

    it('Should move between baselines while morphing', () => {
        const next = area(20)

        next.morphFrom(area(10), 1)

        expect(next.current(0.5))
            .toBe(15)
    })

    it('Should return the baseline when the morph is finished', () => {
        const next = area(20)

        next.morphFrom(area(10), 1)

        expect(next.current(1))
            .toBe(20)
    })
})
