import Pointer from '@/renderer/Pointer'
import CanvasWindow from '@/types/CanvasWindow'
import { Events } from '@/static/Enums'

export class Canvas extends EventTarget {
    style = { touchAction: '' }

    setPointerCapture = jest.fn()
}

export let canvas: Canvas

export const handlers = () => {
    const onChange = jest.fn()
    const onClick = jest.fn()
    const onKeyDown = jest.fn(() => false)
    const onPointerMove = jest.fn()
    const onBlur = jest.fn()
    const canDrag = jest.fn(() => false)
    const hasContextMenuAt = jest.fn(() => false)
    const scrollBy: jest.Mock = jest.fn(() => null)
    const getScrollDrag: jest.Mock = jest.fn(() => null)

    return {
        onChange,
        onClick,
        onKeyDown,
        onPointerMove,
        onBlur,
        canDrag,
        hasContextMenuAt,
        scrollBy,
        getScrollDrag
    }
}

export const pointer = (result: ReturnType<typeof handlers>, enableMove = false) => {
    const target = new Pointer(canvas as unknown as HTMLCanvasElement, () => new CanvasWindow(100, 100), result)

    target.attach(enableMove)

    return target
}

export const event = (type: string, fields: Record<string, unknown> = {}, cancelable = false) => {
    return Object.assign(new Event(type, { cancelable }), fields)
}

export function installPointerEnvironment() {
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
}