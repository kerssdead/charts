import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer key down', () => {
    it('Should pass the key event to the handler', () => {
        const result = handlers()

        pointer(result)

        const keydown = event(Events.KeyDown, { key: 'Enter' }, true)

        canvas.dispatchEvent(keydown)

        expect(result.onKeyDown)
            .toHaveBeenCalledWith(keydown)
    })

    it('Should prevent the default action of a handled key', () => {
        const result = handlers()

        result.onKeyDown.mockReturnValue(true)
        pointer(result)

        const keydown = event(Events.KeyDown, { key: 'Enter' }, true)

        canvas.dispatchEvent(keydown)

        expect(keydown.defaultPrevented)
            .toBe(true)
    })

    it('Should keep the default action of an unhandled key', () => {
        const result = handlers()

        pointer(result)

        const keydown = event(Events.KeyDown, { key: 'Tab' }, true)

        canvas.dispatchEvent(keydown)

        expect(keydown.defaultPrevented)
            .toBe(false)
    })

    it('Should stop listening after detach', () => {
        const result = handlers()
        const target = pointer(result)

        target.detach()
        canvas.dispatchEvent(event(Events.KeyDown, { key: 'Enter' }))

        expect(result.onKeyDown)
            .not.toHaveBeenCalled()
    })
})