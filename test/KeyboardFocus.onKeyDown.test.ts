import Panel from '@/types/Panel'
import { ItemFlag as f } from '@/static/ItemFlag'
import { createFocus, key, stop } from './KeyboardFocusTestData'

const targetPoint = (focus: ReturnType<typeof createFocus>['focus']) => focus.point

describe('Handling key down in keyboard focus', () => {
    it('Should focus the first stop on the first next key and wrap around', () => {
        const { focus } = createFocus([
            stop({ focusPoint: { x: 1, y: 1 } }),
            stop({ focusPoint: { x: 2, y: 2 } })
        ])

        focus.onKeyDown(key('ArrowRight'))

        const first = targetPoint(focus)

        focus.onKeyDown(key('ArrowDown'))

        const second = targetPoint(focus)

        focus.onKeyDown(key('ArrowRight'))

        expect([first, second, targetPoint(focus)])
            .toEqual([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 1 }])
    })

    it('Should focus the last stop on the first previous key and wrap around', () => {
        const { focus } = createFocus([
            stop({ focusPoint: { x: 1, y: 1 } }),
            stop({ focusPoint: { x: 2, y: 2 } })
        ])

        focus.onKeyDown(key('ArrowLeft'))

        const last = targetPoint(focus)

        focus.onKeyDown(key('ArrowUp'))
        focus.onKeyDown(key('ArrowUp'))

        expect([last, targetPoint(focus)])
            .toEqual([{ x: 2, y: 2 }, { x: 2, y: 2 }])
    })

    it('Should jump to the first and last stops with Home and End', () => {
        const { focus } = createFocus([
            stop({ focusPoint: { x: 1, y: 1 } }),
            stop({ focusPoint: { x: 2, y: 2 } }),
            stop({ focusPoint: { x: 3, y: 3 } })
        ])

        focus.onKeyDown(key('End'))

        const last = targetPoint(focus)

        focus.onKeyDown(key('Home'))

        expect([last, targetPoint(focus)])
            .toEqual([{ x: 3, y: 3 }, { x: 1, y: 1 }])
    })

    it('Should order stops by focus order and keep creation order inside one order', () => {
        const { focus } = createFocus([
            stop({ focusOrder: 2, focusPoint: { x: 3, y: 3 } }),
            stop({ focusOrder: 0, focusPoint: { x: 1, y: 1 } }),
            stop({ focusOrder: 1, focusPoint: { x: 2, y: 2 } }),
            stop({ focusOrder: 0, focusPoint: { x: 4, y: 4 } })
        ])
        const points = []

        for (let i = 0; i < 4; i++) {
            focus.onKeyDown(key('ArrowRight'))
            points.push(targetPoint(focus))
        }

        expect(points)
            .toEqual([{ x: 1, y: 1 }, { x: 4, y: 4 }, { x: 2, y: 2 }, { x: 3, y: 3 }])
    })

    it('Should skip items that are not focusable or are ghosts', () => {
        const { focus } = createFocus([
            stop({ focusOrder: null, focusPoint: { x: 1, y: 1 } }),
            stop({ flags: f.Ghost, focusPoint: { x: 2, y: 2 } }),
            stop({ focusPoint: { x: 3, y: 3 } })
        ])

        focus.onKeyDown(key('ArrowRight'))
        focus.onKeyDown(key('ArrowRight'))

        expect(targetPoint(focus))
            .toEqual({ x: 3, y: 3 })
    })

    it('Should handle navigation keys and notify the change', () => {
        const { focus, onChange } = createFocus([stop()])

        expect([focus.onKeyDown(key('ArrowRight')), onChange.mock.calls.length])
            .toEqual([true, 1])
    })

    it('Should leave navigation keys unhandled without stops', () => {
        const { focus, onChange } = createFocus([])

        expect([focus.onKeyDown(key('ArrowRight')), onChange.mock.calls.length])
            .toEqual([false, 0])
    })

    it('Should leave unrelated keys unhandled', () => {
        const { focus } = createFocus([stop()])

        expect(focus.onKeyDown(key('a')))
            .toBe(false)
    })

    it('Should ignore keys pressed with modifiers', () => {
        const { focus } = createFocus([stop()])

        expect([
            focus.onKeyDown(key('ArrowRight', { altKey: true })),
            focus.onKeyDown(key('ArrowRight', { ctrlKey: true })),
            focus.onKeyDown(key('ArrowRight', { metaKey: true })),
            focus.point
        ])
            .toEqual([false, false, false, null])
    })

    it.each(['Enter', ' '])('Should click the focused stop with key "%s"', pressed => {
        const target = stop()
        const { focus } = createFocus([stop(), target])

        focus.onKeyDown(key('End'))

        expect([focus.onKeyDown(key(pressed)), target.onClick.mock.calls.length])
            .toEqual([true, 1])
    })

    it('Should not handle activation keys without a focused stop', () => {
        const target = stop()
        const { focus } = createFocus([target])

        expect([focus.onKeyDown(key('Enter')), focus.onKeyDown(key(' ')), target.onClick.mock.calls.length])
            .toEqual([false, false, 0])
    })

    it('Should clear the focus with Escape', () => {
        const { focus } = createFocus([stop()])

        focus.onKeyDown(key('ArrowRight'))

        expect([focus.onKeyDown(key('Escape')), focus.point])
            .toEqual([true, null])
    })

    it('Should leave Escape unhandled without a focused stop', () => {
        const { focus } = createFocus([stop()])

        expect(focus.onKeyDown(key('Escape')))
            .toBe(false)
    })

    describe('Revealing the focused stop', () => {
        const scrollable = (bounds: { top: number, bottom: number }) => {
            const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

            panel.scroll = { top: 0, height: 100 }
            panel.baseHeight = 50
            panel.clip = { x: 0, y: 10, width: 10, height: 30 }

            const glide = jest.spyOn(panel, 'glideBy')
            const { focus } = createFocus([
                stop({
                    flags: f.Scrollable,
                    panel,
                    focusBounds: { left: 0, right: 10, ...bounds }
                })
            ])

            focus.onKeyDown(key('ArrowRight'))

            return glide
        }

        it('Should scroll up when the stop is above the panel', () => {
            expect(scrollable({ top: 4, bottom: 14 }))
                .toHaveBeenCalledWith(-6)
        })

        it('Should scroll down when the stop is below the panel', () => {
            expect(scrollable({ top: 35, bottom: 45 }))
                .toHaveBeenCalledWith(5)
        })

        it('Should not scroll when the stop is visible', () => {
            expect(scrollable({ top: 15, bottom: 25 }))
                .not.toHaveBeenCalled()
        })
    })
})