import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer context menu', () => {
    it('Should open a context at the point', () => {
        const result = handlers()

        result.hasContextMenuAt = jest.fn(() => true)

        const target = pointer(result)

        const contextmenu = event(Events.ContextMenu, { offsetX: 3, offsetY: 4 }, true)

        canvas.dispatchEvent(contextmenu)

        expect(contextmenu.defaultPrevented)
            .toBe(true)
        expect(target.context)
            .toEqual({ point: { x: 3, y: 4 }, isOpenedFromButton: false })
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should ignore points without a context menu', () => {
        const result = handlers()
        const target = pointer(result)

        canvas.dispatchEvent(event(Events.ContextMenu, {
            offsetX: 3,
            offsetY: 4,
        }))

        expect(target.context)
            .toBeNull()
    })
})