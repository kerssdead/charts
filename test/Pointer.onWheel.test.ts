import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer wheel', () => {
    it('Should zoom with move enabled and ctrl pressed', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.Wheel, {
            deltaY: 100,
            deltaMode: 0,
            ctrlKey: true,
            offsetX: 50,
            offsetY: 50,
        }, true))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should scroll without a modifier', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => true)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, {
            deltaY: 100,
            deltaMode: 0,
            offsetX: 10,
            offsetY: 10,
        }, true))

        expect(result.scrollBy)
            .toHaveBeenCalledWith({ x: 10, y: 10 }, 100)
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should multiply line deltas', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => true)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, {
            deltaY: 2,
            deltaMode: WheelEvent.DOM_DELTA_LINE,
            offsetX: 0,
            offsetY: 0,
        }))

        expect(result.scrollBy)
            .toHaveBeenCalledWith({ x: 0, y: 0 }, 32)
    })
})