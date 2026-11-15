import Pointer from '@/renderer/Pointer'
import CanvasWindow from '@/types/CanvasWindow'
import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer edge cases', () => {
    it('Should not reattach the same mode', () => {
        const result = handlers()
        const target = pointer(result, true)

        target.attach(true)
        target.detach()
    })

    it('Should clear the position when the window cannot move further', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const window = new CanvasWindow(100, 100)

        window.x = 75
        window.y = 75

        const target = new Pointer(canvas as unknown as HTMLCanvasElement, () => window, result)

        target.attach(true)

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
            clientX: 30,
            clientY: 40,
            offsetX: 0,
            offsetY: 0,
        }))

        expect(target.position)
            .toBeNull()
    })

    it('Should not close an absent context', () => {
        const result = handlers()
        const target = pointer(result)

        target.closeContext()

        expect(result.onChange)
            .not.toHaveBeenCalled()
    })

    it('Should not report the same position twice', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            offsetX: 5,
            offsetY: 6,
        }))
        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            offsetX: 5,
            offsetY: 6,
        }))

        expect(result.onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should not start a drag with a non-primary pointer', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: false,
            button: 0,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))
        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: false,
            pointerId: 1,
            clientX: 30,
            clientY: 40,
            offsetX: 0,
            offsetY: 0,
        }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not start a drag with a non-primary button', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: true,
            button: 2,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not start a drag without a scroll handler or drag permission', () => {
        const result = handlers()

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, {
            isPrimary: true,
            button: 0,
            pointerId: 1,
            clientX: 10,
            clientY: 20,
        }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not drag below the movement threshold', () => {
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
        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            clientX: 11,
            clientY: 21,
            offsetX: 4,
            offsetY: 5,
        }))

        expect(target.position)
            .toEqual({ x: 4, y: 5 })
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should not zoom when move is disabled', () => {
        const result = handlers()
        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, {
            deltaY: 100,
            deltaMode: 0,
            ctrlKey: true,
            offsetX: 50,
            offsetY: 50,
        }))

        expect(result.onChange)
            .not.toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should not prevent scrolling without a scroll target', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => null)

        const target = pointer(result)

        target.setScrollable(true)

        const wheel = event(Events.Wheel, { deltaY: 100, deltaMode: 0, offsetX: 10, offsetY: 10 }, true)

        canvas.dispatchEvent(wheel)

        expect(wheel.defaultPrevented)
            .toBe(false)
        expect(result.onChange)
            .not.toHaveBeenCalled()
    })
})