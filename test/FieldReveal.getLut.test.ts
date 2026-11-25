import FieldReveal from '@/helpers/FieldReveal'

const alphas = (lut: Uint32Array) => {
    const bytes = new Uint8Array(lut.buffer, lut.byteOffset, lut.byteLength)

    return Array.from(lut, (_, index) => bytes[index * 4 + 3])
}

const opaque = (count: number) => Uint32Array.from({ length: count }, () => 0xff000000)

const measured = () => {
    const reveal = new FieldReveal()

    reveal.measure(Uint8Array.from([3, 3, 2, 0]), 4)

    return reveal
}

describe('Getting the reveal color table', () => {
    it('Should give the same table when the reveal is complete', () => {
        const lut = opaque(4)

        expect(measured().getLut(lut, 1))
            .toBe(lut)
    })

    it('Should hide every level at the start', () => {
        expect(alphas(measured().getLut(opaque(4), 0)))
            .toEqual([0, 0, 0, 0])
    })

    it('Should show every level at the end', () => {
        expect(alphas(measured().getLut(opaque(4), .999)).every(alpha => alpha > 200))
            .toBe(true)
    })

    it('Should show more levels as the reveal advances', () => {
        const reveal = measured()
        const visible = (progress: number) => {
            return alphas(reveal.getLut(opaque(4), progress)).filter(alpha => alpha > 0).length
        }

        expect(visible(.2))
            .toBeLessThanOrEqual(visible(.6))
        expect(visible(.6))
            .toBeLessThanOrEqual(visible(.95))
    })

    it('Should keep the colors and scale only the opacity', () => {
        const lut = Uint32Array.from([0xff0000ff, 0xff00ff00])
        const result = measured().getLut(lut, .5)

        expect(new Uint8Array(result.buffer, result.byteOffset, 4).slice(0, 3))
            .toEqual(new Uint8Array(lut.buffer, lut.byteOffset, 4).slice(0, 3))
    })

    it('Should not change the given table', () => {
        const lut = opaque(4)

        measured().getLut(lut, .3)

        expect(alphas(lut))
            .toEqual([255, 255, 255, 255])
    })
})