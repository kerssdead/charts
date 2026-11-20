import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'

describe('Getting render item focus', () => {
    const shape = {
        getFocusPoint: () => ({ x: 1, y: 2 }),
        getFocusBounds: () => ({ left: 1, top: 2, right: 3, bottom: 4 })
    } as unknown as RenderItemBase

    it('Should be not focusable by default', () => {
        expect(new RenderItem(shape).focusOrder)
            .toBeNull()
    })

    it('Should take focus point and bounds from the shape', () => {
        const item = new RenderItem(shape)

        expect([item.focusPoint, item.focusBounds])
            .toEqual([{ x: 1, y: 2 }, { left: 1, top: 2, right: 3, bottom: 4 }])
    })
})