import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer dragging', () => {
    it('Should drag the window with move enabled', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: true,
            button: 0,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))

        expect(canvas.setPointerCapture)
            .toHaveBeenCalledWith(1)

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            clientX: 16,
            clientY: 26,
            offsetX: 0,
            offsetY: 0,
        }))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should scroll through the drag handler', () => {
        const result = handlers()
        const scroll = jest.fn(() => true)

        result.getScrollDrag = jest.fn(() => scroll)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: true,
            button: 0,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))
        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            clientX: 10,
            clientY: 30,
            offsetX: 0,
            offsetY: 0,
        }))

        expect(scroll)
            .toHaveBeenCalledWith(10)
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should stop dragging when the pointer capture is lost', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: true,
            button: 0,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))
        canvas.dispatchEvent(event(Events.LostPointerCapture, {
            pointerId: 1,
        }))

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            clientX: 20,
            clientY: 30,
            offsetX: 5,
            offsetY: 6,
        }))

        expect(target.position)
            .toEqual({ x: 5, y: 6 })
    })
})