import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Getting item data at a point', () => {
    it('Should give the data of the item', () => {
        const item = new RenderItem(new RenderItemRectangle())

        item.data = { id: 'item' }

        expect(item.dataAt({ x: 0, y: 0 }))
            .toEqual({ id: 'item' })
    })

    it('Should prefer the data the shape has at the point', () => {
        const shape = new RenderItemRectangle()
        const item = new RenderItem(shape)

        item.data = { id: 'item' }
        shape.dataAt = jest.fn(() => ({ id: 'cell' }))

        expect(item.dataAt({ x: 1, y: 2 }))
            .toEqual({ id: 'cell' })
        expect(shape.dataAt)
            .toHaveBeenCalledWith({ x: 1, y: 2 })
    })

    it('Should give nothing without data', () => {
        expect(new RenderItem(new RenderItemRectangle()).dataAt({ x: 0, y: 0 }))
            .toBeNull()
    })
})