import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import { FocusOrder } from '@/static/Enums'

describe('Making builder item focusable', () => {
    it('Should use the chart order by default', () => {
        expect(new QueueRectangleItemBuilder().focusable().build().focusOrder)
            .toBe(FocusOrder.Chart)
    })

    it('Should use the given order', () => {
        expect(new QueueRectangleItemBuilder().focusable(FocusOrder.Menu).build().focusOrder)
            .toBe(FocusOrder.Menu)
    })

    it('Should not be focusable without the call', () => {
        expect(new QueueRectangleItemBuilder().build().focusOrder)
            .toBeNull()
    })
})