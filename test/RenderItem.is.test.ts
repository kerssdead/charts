import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import { ItemFlag as f } from '@/static/ItemFlag'

describe('Checking item flags', () => {
    const item = () => new RenderItem(new RenderItemRectangle())

    it('Should have only the fading flag by default', () => {
        const target = item()

        expect(target.is(f.Fading))
            .toBe(true)
        expect(target.is(f.Interactive))
            .toBe(false)
        expect(target.is(f.Ghost))
            .toBe(false)
    })

    it('Should report every flag independently', () => {
        const target = item()

        target.set(f.Removable, true)
        target.set(f.ContextMenu, true)

        expect(target.is(f.Removable))
            .toBe(true)
        expect(target.is(f.ContextMenu))
            .toBe(true)
        expect(target.is(f.MenuButton))
            .toBe(false)
    })
})