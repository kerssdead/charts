import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Resolving item tooltip', () => {
    const createItem = () => new RenderItem(new RenderItemRectangle())

    it('Should return the string tooltip as is', () => {
        const item = createItem()

        item.tooltipTemplate = 'text'

        expect(item.tooltipAt({ x: 0, y: 0 }))
            .toBe('text')
    })

    it('Should resolve a lazy tooltip only when hovered', () => {
        const item = createItem()
        const resolve = jest.fn(() => 'resolved')

        item.tooltipTemplate = resolve

        expect(resolve)
            .not.toHaveBeenCalled()

        expect(item.tooltipAt({ x: 0, y: 0 }))
            .toBe('resolved')

        expect(resolve)
            .toHaveBeenCalledTimes(1)
    })

    it('Should return null without a tooltip', () => {
        expect(createItem().tooltipAt({ x: 0, y: 0 }))
            .toBeNull()
    })
})
