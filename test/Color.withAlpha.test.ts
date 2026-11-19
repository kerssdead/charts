import { withAlpha } from '@/helpers/Color'

describe('Adding alpha to a color', () => {
    it('Should append alpha as two hex digits', () => {
        expect(withAlpha('#ff0000', .5))
            .toBe('#ff000080')
    })

    it('Should give 00 for zero and ff for full alpha', () => {
        expect(withAlpha('#ff0000', 0))
            .toBe('#ff000000')
        expect(withAlpha('#ff0000', 1))
            .toBe('#ff0000ff')
    })

    it('Should pad small alpha to two digits', () => {
        expect(withAlpha('#ff0000', 5 / 255))
            .toBe('#ff000005')
    })

    it('Should clamp alpha to the 0..1 range', () => {
        expect(withAlpha('#ff0000', 2))
            .toBe('#ff0000ff')
        expect(withAlpha('#ff0000', -1))
            .toBe('#ff000000')
    })

    it('Should replace existing alpha', () => {
        expect(withAlpha('#ff000080', 1))
            .toBe('#ff0000ff')
    })
})