import { blendColors } from '@/helpers/Color'

describe('Blending colors', () => {
    it('Should give the ends at 0 and 1', () => {
        expect(blendColors('#000000', '#ffffff', 0))
            .toBe('#000000')
        expect(blendColors('#000000', '#ffffff', 1))
            .toBe('#ffffff')
    })

    it('Should blend every channel', () => {
        expect(blendColors('#000000', '#ff6400', .5))
            .toBe('#803200')
    })

    it('Should expand short colors', () => {
        expect(blendColors('#000', '#fff', 1))
            .toBe('#ffffff')
    })

    it('Should blend opacity when a color has it', () => {
        expect(blendColors('#ff000000', '#ff0000ff', .5))
            .toBe('#ff000080')
        expect(blendColors('#ff0000', '#ff000000', 1))
            .toBe('#ff000000')
    })

    it('Should not add opacity when no color has it', () => {
        expect(blendColors('#102030', '#405060', .5))
            .toHaveLength(7)
    })

    it('Should give the target when a color is not a hex color', () => {
        expect(blendColors('red', '#112233', .5))
            .toBe('#112233')
    })
})