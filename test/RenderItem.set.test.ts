import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import { ItemFlag as f } from '@/static/ItemFlag'

describe('Setting item flags', () => {
    const item = () => new RenderItem(new RenderItemRectangle())

    it('Should turn a flag on', () => {
        const target = item()

        target.set(f.Interactive, true)

        expect(target.is(f.Interactive))
            .toBe(true)
    })

    it('Should turn a flag off', () => {
        const target = item()

        target.set(f.Fading, false)

        expect(target.is(f.Fading))
            .toBe(false)
    })

    it('Should keep a flag on when it is set twice', () => {
        const target = item()

        target.set(f.Ghost, true)
        target.set(f.Ghost, true)

        expect(target.is(f.Ghost))
            .toBe(true)
    })

    it('Should not change other flags', () => {
        const target = item()

        target.set(f.Scrollable, true)
        target.set(f.Fixed, true)
        target.set(f.Scrollable, false)

        expect(target.is(f.Fixed))
            .toBe(true)
        expect(target.is(f.Fading))
            .toBe(true)
    })
})