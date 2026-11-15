import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer click', () => {
    it('Should report clicks', () => {
        const result = handlers()
        const target = pointer(result)

        canvas.dispatchEvent(event(Events.Click, {
            offsetX: 5,
            offsetY: 6,
        }))

        expect(result.onClick)
            .toHaveBeenCalledWith({ x: 5, y: 6 })
        expect(target.context)
            .toBeNull()
    })

    it('Should close the context after an outside click', () => {
        const result = handlers()
        const target = pointer(result)

        target.openMenu({ x: 0, y: 0 })

        const outside = event(Events.Click)

        Object.defineProperty(outside, 'target', { value: {} })
        globalThis.document.dispatchEvent(outside)

        expect(target.context)
            .toBeNull()
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should close the context after a canvas click', () => {
        const result = handlers()
        const target = pointer(result)

        target.openMenu({ x: 0, y: 0 })

        const click = event(Events.Click, { offsetX: 1, offsetY: 2 })

        Object.defineProperty(click, 'target', { value: canvas })
        canvas.dispatchEvent(click)

        expect(target.context)
            .toBeNull()
    })
})