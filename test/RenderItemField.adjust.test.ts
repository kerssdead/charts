import CanvasWindow from '@/types/CanvasWindow'
import { fieldItem, WINDOW } from './RenderItemFieldTestData'

describe('Adjusting field to the window', () => {
    it('Should map the box to pixels', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(item.getBounds())
            .toEqual({ left: 200, top: 400, right: 300, bottom: 450 })
    })

    it('Should follow the size of the window', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        const first = item.getBounds()

        item.adjust(new CanvasWindow(2000, 2000))

        expect(item.getBounds().right - item.getBounds().left)
            .toBe((first.right - first.left) * 2)
    })
})