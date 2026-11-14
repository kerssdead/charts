import Pointer from '@/renderer/Pointer'
import CanvasWindow from '@/types/CanvasWindow'
import { Events } from '@/static/Enums'

class Canvas extends EventTarget {
    style = { touchAction: '' }

    setPointerCapture = jest.fn()
}

let canvas: Canvas

const handlers = () => {
    const onChange = jest.fn()
    const onClick = jest.fn()
    const canDrag = jest.fn(() => false)
    const hasContextMenuAt = jest.fn(() => false)
    const scrollBy = jest.fn(() => null)
    const getScrollDrag = jest.fn(() => null)

    return {
        onChange,
        onClick,
        canDrag,
        hasContextMenuAt,
        scrollBy,
        getScrollDrag
    }
}

const pointer = (result: ReturnType<typeof handlers>, enableMove = false) => {
    const target = new Pointer(canvas as unknown as HTMLCanvasElement, () => new CanvasWindow(100, 100), result)

    target.attach(enableMove)

    return target
}

const event = (type: string, fields: Record<string, unknown> = {}, cancelable = false) => {
    return Object.assign(new Event(type, { cancelable }), fields)
}

beforeEach(() => {
    canvas = new Canvas()

    Object.assign(globalThis, {
        document: new EventTarget(),
        window: new EventTarget(),
        WheelEvent: { DOM_DELTA_LINE: 1 }
    })
})

afterEach(() => {
    delete (globalThis as Record<string, unknown>).document
    delete (globalThis as Record<string, unknown>).window
    delete (globalThis as Record<string, unknown>).WheelEvent
})

describe('Pointer move', () => {
    it('Should follow primary pointer moves', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 10, offsetY: 20 }))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toEqual({ x: 10, y: 20 })
    })

    it('Should ignore non-primary pointers', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: false, offsetX: 10, offsetY: 20 }))

        expect(result.onChange)
            .not.toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should clear the position on pointer leave and window blur', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 1, offsetY: 2 }))
        canvas.dispatchEvent(event(Events.PointerLeave))

        expect(target.position)
            .toBeNull()

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 1, offsetY: 2 }))
        globalThis.window.dispatchEvent(event(Events.Blur))

        expect(target.position)
            .toBeNull()
    })
})

describe('Pointer click', () => {
    it('Should report clicks', () => {
        const result = handlers()
        const target = pointer(result)

        canvas.dispatchEvent(event(Events.Click, { offsetX: 5, offsetY: 6 }))

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


describe('Pointer context menu', () => {
    it('Should open a context at the point', () => {
        const result = handlers()

        result.hasContextMenuAt = jest.fn(() => true)

        const target = pointer(result)

        const contextmenu = event(Events.ContextMenu, { offsetX: 3, offsetY: 4 }, true)

        canvas.dispatchEvent(contextmenu)

        expect(contextmenu.defaultPrevented)
            .toBe(true)
        expect(target.context)
            .toEqual({ point: { x: 3, y: 4 }, isMenu: false })
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should ignore points without a context menu', () => {
        const result = handlers()
        const target = pointer(result)

        canvas.dispatchEvent(event(Events.ContextMenu, { offsetX: 3, offsetY: 4 }))

        expect(target.context)
            .toBeNull()
    })
})

describe('Pointer dragging', () => {
    it('Should drag the window with move enabled', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))

        expect(canvas.setPointerCapture)
            .toHaveBeenCalledWith(1)

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, clientX: 16, clientY: 26, offsetX: 0, offsetY: 0 }))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should scroll through the drag handler', () => {
        const result = handlers()
        const scroll = jest.fn(() => true)

        result.getScrollDrag = jest.fn(() => scroll)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, clientX: 10, clientY: 30, offsetX: 0, offsetY: 0 }))

        expect(scroll)
            .toHaveBeenCalledWith(10)
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should stop dragging when the pointer capture is lost', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))
        canvas.dispatchEvent(event(Events.LostPointerCapture, { pointerId: 1 }))

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, clientX: 20, clientY: 30, offsetX: 5, offsetY: 6 }))

        expect(target.position)
            .toEqual({ x: 5, y: 6 })
    })
})

describe('Pointer wheel', () => {
    it('Should zoom with move enabled and ctrl pressed', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.Wheel, { deltaY: 100, deltaMode: 0, ctrlKey: true, offsetX: 50, offsetY: 50 }, true))

        expect(result.onChange)
            .toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should scroll without a modifier', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => true)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, { deltaY: 100, deltaMode: 0, offsetX: 10, offsetY: 10 }, true))

        expect(result.scrollBy)
            .toHaveBeenCalledWith({ x: 10, y: 10 }, 100)
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should multiply line deltas', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => true)

        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, { deltaY: 2, deltaMode: WheelEvent.DOM_DELTA_LINE, offsetX: 0, offsetY: 0 }))

        expect(result.scrollBy)
            .toHaveBeenCalledWith({ x: 0, y: 0 }, 32)
    })
})

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



describe('Pointer edge cases', () => {
    it('Should not reattach the same mode', () => {
        const result = handlers()
        const target = pointer(result, true)

        target.attach(true)
        target.detach()
    })

    it('Should clear the position when the window cannot move further', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const window = new CanvasWindow(100, 100)

        window.x = 75
        window.y = 75

        const target = new Pointer(canvas as unknown as HTMLCanvasElement, () => window, result)

        target.attach(true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, clientX: 30, clientY: 40, offsetX: 0, offsetY: 0 }))

        expect(target.position)
            .toBeNull()
    })

    it('Should not close an absent context', () => {
        const result = handlers()
        const target = pointer(result)

        target.closeContext()

        expect(result.onChange)
            .not.toHaveBeenCalled()
    })

    it('Should not report the same position twice', () => {
        const result = handlers()
        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 5, offsetY: 6 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, offsetX: 5, offsetY: 6 }))

        expect(result.onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should not start a drag with a non-primary pointer', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: false, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: false, pointerId: 1, clientX: 30, clientY: 40, offsetX: 0, offsetY: 0 }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not start a drag with a non-primary button', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 2, pointerId: 1, clientX: 10, clientY: 20 }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not start a drag without a scroll handler or drag permission', () => {
        const result = handlers()

        pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))

        expect(canvas.setPointerCapture)
            .not.toHaveBeenCalled()
    })

    it('Should not drag below the movement threshold', () => {
        const result = handlers()

        result.canDrag = jest.fn(() => true)

        const target = pointer(result, true)

        canvas.dispatchEvent(event(Events.PointerDown, { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 20 }))
        canvas.dispatchEvent(event(Events.PointerMove, { isPrimary: true, pointerId: 1, clientX: 11, clientY: 21, offsetX: 4, offsetY: 5 }))

        expect(target.position)
            .toEqual({ x: 4, y: 5 })
        expect(result.onChange)
            .toHaveBeenCalled()
    })

    it('Should not zoom when move is disabled', () => {
        const result = handlers()
        const target = pointer(result)

        target.setScrollable(true)

        canvas.dispatchEvent(event(Events.Wheel, { deltaY: 100, deltaMode: 0, ctrlKey: true, offsetX: 50, offsetY: 50 }))

        expect(result.onChange)
            .not.toHaveBeenCalled()
        expect(target.position)
            .toBeNull()
    })

    it('Should not prevent scrolling without a scroll target', () => {
        const result = handlers()

        result.scrollBy = jest.fn(() => null)

        const target = pointer(result)

        target.setScrollable(true)

        const wheel = event(Events.Wheel, { deltaY: 100, deltaMode: 0, offsetX: 10, offsetY: 10 }, true)

        canvas.dispatchEvent(wheel)

        expect(wheel.defaultPrevented)
            .toBe(false)
        expect(result.onChange)
            .not.toHaveBeenCalled()
    })
})
