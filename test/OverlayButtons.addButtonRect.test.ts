import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import { addButtonRect } from '@/renderer/OverlayButtons'
import { FocusOrder } from '@/static/Enums'
import { LIGHT_THEME } from '@/Theme'

describe('Adding button rectangle', () => {
    it('Should make the button a focus stop with the given order', () => {
        const items = new QueueItemsBuilder()
        const onClick = jest.fn()

        const background = addButtonRect(items, Units.fromSize(100, 100), {
            rect: { x: 0, y: 0, width: 10, height: 10 },
            radius: 2,
            hover: 0,
            focusOrder: FocusOrder.Legend,
            onClick
        }, LIGHT_THEME).build()

        expect([background.focusOrder, background.onClick])
            .toEqual([FocusOrder.Legend, onClick])
    })
})