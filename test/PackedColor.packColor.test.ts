import { packColor } from '@/helpers/PackedColor'

const bytesOf = (color: number) => [...new Uint8Array(Uint32Array.of(color).buffer)]

describe('Packing a color', () => {
    it('Should pack red, green, blue and opaque alpha in image data order', () => {
        expect(bytesOf(packColor('#102030')))
            .toEqual([16, 32, 48, 255])
    })

    it('Should read the alpha of eight digit colors', () => {
        expect(bytesOf(packColor('#10203040')))
            .toEqual([16, 32, 48, 64])
    })

    it('Should expand short hex colors', () => {
        expect(bytesOf(packColor('#fff')))
            .toEqual([255, 255, 255, 255])
    })

    it('Should turn a color that is not a hex color into opaque black', () => {
        expect(bytesOf(packColor('red')))
            .toEqual([0, 0, 0, 255])
    })
})