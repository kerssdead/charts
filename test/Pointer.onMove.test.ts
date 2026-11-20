import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer move', () => {
    it('Should follow primary pointer moves', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            offsetX: 10,
            offsetY: 20,
        }))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toEqual({ x: 10, y: 20 })
    })

    it('Should report primary pointer moves to the handler', () => {
        const result = handlers()

        pointer(result, true)
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 1, offsetY: 2 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: false, offsetX: 1, offsetY: 2 }))

        expect(result.onPointerMove)
            .toHaveBeenCalledTimes(1)
    })

    it('Should ignore non-primary pointers', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: false,
            offsetX: 10,
            offsetY: 20,
        }))

        expect(result.onChange)
            .not.toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should clear the position on pointer leave and window blur', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            offsetX: 1,
            offsetY: 2,
        }))
        canvas.dispatchEvent(event(Events.PointerLeave))

        expect(target.position)
            .toBeNull()

        canvas.dispatchEvent(event(Events.PointerMove, {
            isPrimary: true,
            pointerId: 1,
            offsetX: 1,
            offsetY: 2,
        }))
        globalThis.window.dispatchEvent(event(Events.Blur))

        expect(target.position)
            .toBeNull()
    })
})