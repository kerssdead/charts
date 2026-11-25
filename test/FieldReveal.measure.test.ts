import FieldReveal from '@/helpers/FieldReveal'

const alphas = (lut: Uint32Array) => {
    const bytes = new Uint8Array(lut.buffer, lut.byteOffset, lut.byteLength)

    return Array.from(lut, (_, index) => bytes[index * 4 + 3])
}

const opaque = (count: number) => Uint32Array.from({ length: count }, () => 0xff000000)

describe('Measuring levels for the reveal', () => {
    it('Should reveal higher levels before lower ones', () => {
        const reveal = new FieldReveal()

        reveal.measure(Uint8Array.from([3, 3, 2, 0]), 4)

        const [lowest, , second, highest] = alphas(reveal.getLut(opaque(4), .4))

        expect(highest)
            .toBe(255)
        expect(second)
            .toBeLessThan(255)
        expect(lowest)
            .toBe(0)
    })

    it('Should reveal rare high levels earlier than common low ones', () => {
        const reveal = new FieldReveal()

        reveal.measure(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 2)

        const [common, rare] = alphas(reveal.getLut(opaque(2), .2))

        expect(rare)
            .toBeGreaterThan(common)
        expect(common)
            .toBeLessThan(255)
    })
})