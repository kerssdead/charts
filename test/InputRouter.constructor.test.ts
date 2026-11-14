import { createRouter, item, WINDOW } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

const POINT = { x: 5, y: 5 }

describe('Creating input router', () => {
    it('Should give the pointer the layout window', () => {
        expect(createRouter().getWindow())
            .toBe(WINDOW)
    })

    it('Should click the top clickable item and report a change', () => {
        const lower = jest.fn()
        const upper = jest.fn()
        const { handlers, onChange } = createRouter([item(true, lower), item(true, upper)])

        handlers.onClick(POINT)

        expect([lower.mock.calls.length, upper.mock.calls.length])
            .toEqual([0, 1])
        expect(onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should report a change after clicking empty space', () => {
        const { handlers, onChange } = createRouter([item(false, jest.fn())])

        handlers.onClick(POINT)

        expect(onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should report a failed click', () => {
        const error = new Error('Broken')
        const { handlers, onError } = createRouter([item(true, () => { throw error })])

        handlers.onClick(POINT)

        expect(onError)
            .toHaveBeenCalledWith(error)
    })

    it('Should report pointer changes', () => {
        const { handlers, onChange } = createRouter()

        handlers.onChange()

        expect(onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should drag only over empty space without an open context menu', () => {
        const over = createRouter([item(true, jest.fn())])
        const empty = createRouter([item(false, jest.fn())])
        const withContext = createRouter([])

        withContext.pointer.context = {}

        expect([over.handlers.canDrag(POINT), empty.handlers.canDrag(POINT), withContext.handlers.canDrag(POINT)])
            .toEqual([false, true, false])
    })

    it('Should pass the open context menu state to clickable checks', () => {
        const clickable = item(true, jest.fn())
        const { handlers, pointer } = createRouter([clickable])

        pointer.context = {}
        handlers.onClick(POINT)

        expect(clickable.isClickableAt)
            .toHaveBeenCalledWith(POINT, true)
    })

    it('Should offer a context menu only when configured and an item has one', () => {
        const contextMenu = [{ title: 'Action' }] as never
        const configured = createRouter([item(true)], { contextMenu })
        const unconfigured = createRouter([item(true)])
        const nothingUnder = createRouter([item(false)], { contextMenu })

        expect([
            configured.handlers.hasContextMenuAt(POINT),
            unconfigured.handlers.hasContextMenuAt(POINT),
            nothingUnder.handlers.hasContextMenuAt(POINT)
        ])
            .toEqual([true, false, false])
    })

    it('Should scroll panels', () => {
        const { handlers, panels } = createRouter()

        expect(handlers.scrollBy(POINT, 10))
            .toBe(true)
        expect(panels.scrollBy)
            .toHaveBeenCalledWith(POINT, 10)
    })

    it('Should get scroll drag from panels', () => {
        const { handlers, panels } = createRouter()

        expect(handlers.getScrollDrag(POINT))
            .toBeNull()
        expect(panels.getScrollDrag)
            .toHaveBeenCalledWith(POINT)
    })
})