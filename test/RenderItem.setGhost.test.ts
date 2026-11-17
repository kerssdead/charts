import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import { ItemFlag as f } from '@/static/ItemFlag'

describe('Setting item ghost state', () => {
    const interactiveItem = () => {
        const item = new RenderItem(new RenderItemRectangle())

        item.set(f.Interactive, true)
        item.set(f.ContextMenu, true)
        item.tooltipTemplate = 'tooltip'

        return item
    }

    it('Should mark the item as a ghost', () => {
        const item = interactiveItem()

        item.setGhost(true)

        expect(item.is(f.Ghost))
            .toBe(true)
    })

    it('Should remove interaction from a ghost', () => {
        const item = interactiveItem()

        item.setGhost(true)

        expect(item.is(f.Interactive))
            .toBe(false)
        expect(item.is(f.ContextMenu))
            .toBe(false)
        expect(item.tooltipTemplate)
            .toBe('')
    })

    it('Should keep interaction when the ghost is turned off', () => {
        const item = interactiveItem()

        item.setGhost(false)

        expect(item.is(f.Ghost))
            .toBe(false)
        expect(item.is(f.Interactive))
            .toBe(true)
        expect(item.tooltipTemplate)
            .toBe('tooltip')
    })
})