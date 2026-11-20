import { createFocus, key, stop } from './KeyboardFocusTestData'

describe('Clearing keyboard focus', () => {
    it('Should remove the focused stop and notify the change', () => {
        const { focus, onChange } = createFocus([stop()])

        focus.onKeyDown(key('ArrowRight'))
        onChange.mockClear()
        focus.clear()

        expect([focus.point, onChange.mock.calls.length])
            .toEqual([null, 1])
    })

    it('Should not notify when nothing is focused', () => {
        const { focus, onChange } = createFocus([stop()])

        focus.clear()

        expect(onChange)
            .not.toHaveBeenCalled()
    })
})