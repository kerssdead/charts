import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer focus out', () => {
    it('Should report when the canvas loses focus', () => {
        const result = handlers()

        pointer(result)
        canvas.dispatchEvent(event(Events.FocusOut))

        expect(result.onBlur)
            .toHaveBeenCalledTimes(1)
    })

    it('Should stop listening after detach', () => {
        const result = handlers()
        const target = pointer(result)

        target.detach()
        canvas.dispatchEvent(event(Events.FocusOut))

        expect(result.onBlur)
            .not.toHaveBeenCalled()
    })
})