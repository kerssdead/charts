import { diffuse } from '@/helpers/FieldBlur'
import FieldLife from '@/helpers/FieldLife'

const sourcesOf = (value: number) => Float32Array.from({ length: 25 }, () => value)

const fieldOf = (max: number) => {
    return { columns: 5, rows: 5, values: new Float32Array(25), min: 0, max, lut: new Uint32Array(1) }
}

const diffusionOf = (sources: Float32Array) => ({ sources, sigmaX: 1, sigmaY: 1 })

describe('Getting the field values of a living field', () => {
    it('Should match the settled field when it just started', () => {
        const life = new FieldLife()
        const diffusion = diffusionOf(sourcesOf(5))

        life.tick(0, null)

        expect([...life.getValues(fieldOf(5), diffusion)])
            .toEqual([...diffuse(diffusion, 1, { columns: 5, rows: 5 })])
    })

    it('Should breathe away from the settled field over time', () => {
        const life = new FieldLife()
        const diffusion = diffusionOf(sourcesOf(5))
        const settled = [...diffuse(diffusion, 1, { columns: 5, rows: 5 })]

        life.tick(0, null)
        life.tick(3000, null)

        const alive = [...life.getValues(fieldOf(5), diffusion)]

        expect(alive.some((value, index) => Math.abs(value - settled[index]) > .1))
            .toBe(true)
    })

    it('Should breathe only a little', () => {
        const life = new FieldLife()
        const diffusion = diffusionOf(sourcesOf(5))
        const settled = [...diffuse(diffusion, 1, { columns: 5, rows: 5 })]

        life.tick(0, null)
        life.tick(3000, null)

        life.getValues(fieldOf(5), diffusion).forEach((value, index) => {
            expect(Math.abs(value / settled[index] - 1))
                .toBeLessThan(.5)
        })
    })

    it('Should give zeros for no sources and no pointer', () => {
        const life = new FieldLife()

        life.tick(0, null)
        life.tick(2000, null)

        expect([...life.getValues(fieldOf(5), diffusionOf(sourcesOf(0)))].every(value => value === 0))
            .toBe(true)
    })

    it('Should scale the pointer heat with the field maximum', () => {
        const small = new FieldLife()
        const large = new FieldLife()

        for (let now = 0; now <= 300; now += 16) {
            small.tick(now, { u: .5, v: .5 })
            large.tick(now, { u: .5, v: .5 })
        }

        expect(large.getValues(fieldOf(100), diffusionOf(sourcesOf(0)))[12])
            .toBeCloseTo(small.getValues(fieldOf(10), diffusionOf(sourcesOf(0)))[12] * 10)
    })
})