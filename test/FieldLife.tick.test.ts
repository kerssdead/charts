import FieldLife from '@/helpers/FieldLife'

const DIFFUSION = { sources: new Float32Array(25), sigmaX: 1, sigmaY: 1 }

const FIELD = { columns: 5, rows: 5, values: new Float32Array(25), min: 0, max: 10, lut: new Uint32Array(1) }

const hover = (life: FieldLife, target: { u: number, v: number } | null, until: number) => {
    for (let now = 0; now <= until; now += 16)
        life.tick(now, target)
}

describe('Ticking the field life', () => {
    it('Should become active on the first tick', () => {
        const life = new FieldLife()

        life.tick(500, null)

        expect(life.isActive)
            .toBe(true)
    })

    it('Should give a new frame about every 33 ms', () => {
        const life = new FieldLife()

        life.tick(0, null)

        expect(life.frame)
            .toBe(0)

        life.tick(32, null)

        expect(life.frame)
            .toBe(0)

        life.tick(66, null)

        expect(life.frame)
            .toBe(2)
    })

    it('Should add heat under a hovering pointer', () => {
        const life = new FieldLife()

        hover(life, { u: .5, v: .5 }, 500)

        const values = life.getValues(FIELD, DIFFUSION)

        expect(values[12])
            .toBeGreaterThan(values[0])
        expect(values[12])
            .toBeGreaterThan(1)
    })

    it('Should put the heat where the pointer is', () => {
        const life = new FieldLife()

        hover(life, { u: .9, v: .1 }, 100)

        const values = [...life.getValues(FIELD, DIFFUSION)]

        expect(values.indexOf(Math.max(...values)))
            .toBe(4)
    })

    it('Should remove the heat after the pointer leaves', () => {
        const life = new FieldLife()

        hover(life, { u: .5, v: .5 }, 500)

        const hot = life.getValues(FIELD, DIFFUSION)[12]

        for (let now = 516; now < 4000; now += 100)
            life.tick(now, null)

        expect(life.getValues(FIELD, DIFFUSION)[12])
            .toBeLessThan(hot / 100)
    })

    it('Should follow the pointer smoothly after the first tick', () => {
        const life = new FieldLife()

        hover(life, { u: .1, v: .5 }, 500)
        life.tick(516, { u: .9, v: .5 })

        const values = [...life.getValues(FIELD, DIFFUSION)]

        expect(values.indexOf(Math.max(...values)) % 5)
            .toBeLessThan(4)
    })
})