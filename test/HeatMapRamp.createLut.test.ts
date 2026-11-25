import { createLut } from '@/render/heatMap/HeatMapRamp'

const bytesOf = (lut: Uint32Array, index: number) => {
    return [...new Uint8Array(lut.buffer, lut.byteOffset + index * 4, 4)]
}

describe('Creating a color lookup table', () => {
    it('Should have one entry for every color', () => {
        expect(createLut(['#000000', '#ffffff', '#ff0000']))
            .toHaveLength(3)
    })

    it('Should pack red, green, blue and opaque alpha', () => {
        expect(bytesOf(createLut(['#102030']), 0))
            .toEqual([16, 32, 48, 255])
    })

    it('Should read the alpha of eight digit colors', () => {
        expect(bytesOf(createLut(['#10203040']), 0))
            .toEqual([16, 32, 48, 64])
    })

    it('Should turn a color that is not a hex color into opaque black', () => {
        expect(bytesOf(createLut(['red']), 0))
            .toEqual([0, 0, 0, 255])
    })

    it('Should keep the order of colors', () => {
        const lut = createLut(['#ff0000', '#0000ff'])

        expect(bytesOf(lut, 0)[0])
            .toBe(255)
        expect(bytesOf(lut, 1)[2])
            .toBe(255)
    })
})