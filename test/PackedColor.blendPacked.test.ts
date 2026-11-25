import { blendPacked, packColor } from '@/helpers/PackedColor'

const bytesOf = (color: number) => [...new Uint8Array(Uint32Array.of(color).buffer)]

const BLACK = packColor('#000000')

const WHITE = packColor('#ffffff')

describe('Blending packed colors', () => {
    it('Should give the first color at the start', () => {
        expect(blendPacked(BLACK, WHITE, 0))
            .toBe(BLACK)
    })

    it('Should give the second color at the end', () => {
        expect(blendPacked(BLACK, WHITE, 1))
            .toBe(WHITE)
    })

    it('Should blend every channel', () => {
        expect(bytesOf(blendPacked(packColor('#00204080'), packColor('#4060a0ff'), .5)))
            .toEqual([32, 64, 112, 192])
    })

    it('Should fade in a color from transparent without darkening it', () => {
        expect(bytesOf(blendPacked(0, packColor('#ff0000'), .5)))
            .toEqual([255, 0, 0, 128])
    })

    it('Should fade out a color to transparent without darkening it', () => {
        expect(bytesOf(blendPacked(packColor('#ff0000'), 0, .5)))
            .toEqual([255, 0, 0, 128])
    })

    it('Should give an unsigned value', () => {
        expect(blendPacked(WHITE, WHITE, .5))
            .toBe(WHITE)
    })
})