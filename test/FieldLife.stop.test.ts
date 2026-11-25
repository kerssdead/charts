import FieldLife from '@/helpers/FieldLife'

describe('Stopping the field life', () => {
    it('Should be inactive from the start', () => {
        expect(new FieldLife().isActive)
            .toBe(false)
    })

    it('Should become inactive after stopping', () => {
        const life = new FieldLife()

        life.tick(1000, null)
        life.stop()

        expect(life.isActive)
            .toBe(false)
        expect(life.frame)
            .toBe(-1)
    })

    it('Should forget the pointer heat', () => {
        const life = new FieldLife()

        for (let now = 0; now < 1000; now += 16)
            life.tick(now, { u: .5, v: .5 })

        life.stop()
        life.tick(2000, null)

        expect(life.getValues(FIELD, DIFFUSION)[12])
            .toBeCloseTo(0)
    })
})

const DIFFUSION = { sources: new Float32Array(25), sigmaX: 1, sigmaY: 1 }

const FIELD = { columns: 5, rows: 5, values: new Float32Array(25), min: 0, max: 10, lut: new Uint32Array(1) }