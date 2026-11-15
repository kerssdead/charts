import { Events } from '@/static/Enums'
import { canvas, event, handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

describe('Pointer dragging mode', () => {
    it('Should set touch action for scrollable canvas', () => {
        const result = handlers()
        const target = pointer(result)

        target.setScrollable(true)

        expect(canvas.style.touchAction)
            .toBe('none')
        target.setScrollable(false)

        expect(canvas.style.touchAction)
            .toBe('')
    })
})