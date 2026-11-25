import { diffuse } from '@/helpers/FieldBlur'

const GRID = { columns: 5, rows: 5 }

const centered = (sigmaX: number, sigmaY = sigmaX) => {
    const sources = new Float32Array(25)

    sources[12] = 10

    return { sources, sigmaX, sigmaY }
}

describe('Diffusing a field', () => {
    it('Should keep the source value at the source', () => {
        expect(diffuse(centered(1), 1, GRID)[12])
            .toBeCloseTo(10)
    })

    it('Should spread to neighbours with a gaussian falloff', () => {
        const values = diffuse(centered(1), 1, GRID)

        expect(values[13])
            .toBeCloseTo(10 * Math.exp(-.5))
        expect(values[18])
            .toBeCloseTo(10 * Math.exp(-1))
    })

    it('Should spread less at the start of the progress', () => {
        const wide = diffuse(centered(2), 1, GRID)
        const narrow = diffuse(centered(2), .01, GRID)

        expect(narrow[13])
            .toBeLessThan(wide[13])
    })

    it('Should never spread narrower than half a cell', () => {
        const values = diffuse(centered(4), 0, GRID)

        expect(values[13])
            .toBeCloseTo(10 * Math.exp(-2))
    })

    it('Should spread each axis by its own sigma', () => {
        const values = diffuse(centered(2, 1), 1, GRID)

        expect(values[13])
            .toBeGreaterThan(values[17])
    })

    it('Should scale with the sources', () => {
        const base = diffuse(centered(1), 1, GRID)
        const doubled = diffuse({ ...centered(1), sources: centered(1).sources.map(value => value * 2) }, 1, GRID)

        expect(doubled[13])
            .toBeCloseTo(base[13] * 2)
    })

    it('Should not change the sources', () => {
        const diffusion = centered(1)

        diffuse(diffusion, 1, GRID)

        expect(diffusion.sources[12])
            .toBe(10)
        expect(diffusion.sources[13])
            .toBe(0)
    })

    it('Should give zeros for no sources', () => {
        const values = diffuse({ sources: new Float32Array(25), sigmaX: 1, sigmaY: 1 }, 1, GRID)

        expect([...values].every(value => value === 0))
            .toBe(true)
    })
})