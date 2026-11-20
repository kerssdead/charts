import { createRouter } from './InputRouterTestScene'
import { stop } from './KeyboardFocusTestData'

jest.mock('@/renderer/Pointer')

const key = (name: string, fields: Partial<KeyboardEvent> = {}) => ({ key: name, ...fields }) as KeyboardEvent

const focusable = () => stop({ focusPoint: { x: 7, y: 8 }, focusBounds: { left: 1, top: 2, right: 3, bottom: 4 } })

const createFocused = () => {
    const result = createRouter([focusable()] as never)

    result.handlers.onKeyDown(key('ArrowRight'))

    return result
}

describe('Handling keyboard in input router', () => {
    it('Should navigate focus stops with arrow keys', () => {
        const { handlers, onChange } = createRouter([focusable()] as never)

        expect([handlers.onKeyDown(key('ArrowRight')), onChange.mock.calls.length])
            .toEqual([true, 1])
    })

    it('Should report keyboard focus as position and ring bounds', () => {
        const { router } = createFocused()

        expect([router.position, router.focusBounds])
            .toEqual([{ x: 7, y: 8 }, { left: 1, top: 2, right: 3, bottom: 4 }])
    })

    it('Should prefer the pointer position without keyboard focus', () => {
        const { router, pointer } = createRouter([focusable()] as never)

        expect([router.position, router.focusBounds, pointer.position])
            .toEqual([{ x: 1, y: 2 }, null, { x: 1, y: 2 }])
    })

    it('Should drop keyboard focus when the pointer moves', () => {
        const { router, handlers, pointer } = createFocused()

        handlers.onPointerMove()

        expect(router.position)
            .toBe(pointer.position)
    })

    it('Should drop keyboard focus when the canvas loses focus', () => {
        const { router, handlers, pointer } = createFocused()

        handlers.onBlur()

        expect(router.position)
            .toBe(pointer.position)
    })

    it('Should keep keyboard focus on blur while a context menu is open', () => {
        const { router, handlers, pointer } = createFocused()

        pointer.context = {}
        handlers.onBlur()

        expect(router.position)
            .toEqual({ x: 7, y: 8 })
    })

    describe('Opening menus', () => {
        it('Should open the chart menu with Enter when nothing is focused', () => {
            const { handlers, openChartMenu } = createRouter()

            openChartMenu.mockReturnValue(true)

            expect([handlers.onKeyDown(key('Enter')), openChartMenu.mock.calls.length])
                .toEqual([true, 1])
        })

        it('Should leave Enter unhandled when there is no chart menu', () => {
            const { handlers } = createRouter()

            expect(handlers.onKeyDown(key('Enter')))
                .toBe(false)
        })

        it('Should activate the focused stop with Enter instead of opening the chart menu', () => {
            const target = focusable()
            const { handlers, openChartMenu } = createRouter([target] as never)

            handlers.onKeyDown(key('ArrowRight'))
            handlers.onKeyDown(key('Enter'))

            expect([target.onClick.mock.calls.length, openChartMenu.mock.calls.length])
                .toEqual([1, 0])
        })

        it.each([
            ['ContextMenu', {}],
            ['F10', { shiftKey: true }]
        ])('Should open the context menu at the focus with %s', (name, fields) => {
            const { handlers, pointer } = createFocused()

            expect([handlers.onKeyDown(key(name, fields)), pointer.openContextMenuAt.mock.calls])
                .toEqual([true, [[{ x: 7, y: 8 }]]])
        })

        it('Should not open the context menu with F10 alone', () => {
            const { handlers, pointer } = createFocused()

            expect([handlers.onKeyDown(key('F10')), pointer.openContextMenuAt.mock.calls.length])
                .toEqual([false, 0])
        })

        it('Should not open the context menu without keyboard focus', () => {
            const { handlers, pointer } = createRouter([focusable()] as never)

            expect([handlers.onKeyDown(key('ContextMenu')), pointer.openContextMenuAt.mock.calls.length])
                .toEqual([false, 0])
        })

        it('Should leave the key unhandled where the focus has no context menu', () => {
            const { handlers, pointer } = createFocused()

            pointer.openContextMenuAt.mockReturnValue(false)

            expect(handlers.onKeyDown(key('ContextMenu')))
                .toBe(false)
        })
    })
})