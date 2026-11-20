import { createFocus, key, stop } from './KeyboardFocusTestData'

describe('Getting keyboard focus point', () => {
    it('Should be empty before any key is pressed', () => {
        const { focus } = createFocus([stop()])

        expect(focus.point)
            .toBeNull()
    })

    it('Should follow the focus point of the focused stop', () => {
        const target = stop({ focusPoint: { x: 5, y: 6 } })
        const { focus } = createFocus([target])

        focus.onKeyDown(key('ArrowRight'))
        target.focusPoint = { x: 7, y: 8 }

        expect(focus.point)
            .toEqual({ x: 7, y: 8 })
    })

    it('Should be empty when the focused stop has no point', () => {
        const { focus } = createFocus([stop({ focusPoint: null })])

        focus.onKeyDown(key('ArrowRight'))

        expect(focus.point)
            .toBeNull()
    })

    it('Should be empty when the focused stop is gone', () => {
        const { focus, queue } = createFocus([stop(), stop()])

        focus.onKeyDown(key('End'))
        queue.items.length = 1
        queue.version++

        expect(focus.point)
            .toBeNull()
    })

    it('Should rebuild stops when the queue version changes', () => {
        const { focus, queue } = createFocus([stop({ focusPoint: { x: 1, y: 1 } })])

        focus.onKeyDown(key('ArrowRight'))
        queue.items.unshift(stop({ focusPoint: { x: 9, y: 9 } }))
        queue.version++

        expect(focus.point)
            .toEqual({ x: 9, y: 9 })
    })
})