import Pointer from '@/renderer/Pointer'
import CanvasWindow from '@/types/CanvasWindow'

class Canvas extends EventTarget {
    style = { touchAction: '' }
}

let canvas: Canvas

beforeEach(() => {
    canvas = new Canvas();

    (globalThis as any).document = new EventTarget();
    (globalThis as any).window = new EventTarget();
    (globalThis as any).WheelEvent = { DOM_DELTA_LINE: 1 }
})

afterEach(() => {
    delete (globalThis as any).document
    delete (globalThis as any).window
    delete (globalThis as any).WheelEvent
})

function create(enableMove: boolean | undefined) {
    const scrollBy = jest.fn(() => true)

    const pointer = new Pointer(canvas as unknown as HTMLCanvasElement, () => new CanvasWindow(100, 100), {
        onClick: () => {},
        onChange: () => {},
        canDrag: () => false,
        hasContextMenuAt: () => false,
        scrollBy,
        getScrollDrag: () => null
    })

    pointer.attach(enableMove as boolean)
    pointer.setScrollable(true)

    return { pointer, scrollBy }
}

function wheel() {
    canvas.dispatchEvent(Object.assign(new Event('wheel', { cancelable: true }), { deltaY: 100, deltaMode: 0, offsetX: 10, offsetY: 10 }))
}

describe('Pointer scrolling', () => {
    it.each([true, false, undefined])('Should scroll by wheel when enableMove is %s', enableMove => {
        const { scrollBy } = create(enableMove)

        wheel()

        expect(scrollBy)
            .toHaveBeenCalledWith({ x: 10, y: 10 }, 100)
    })

    it('Should not scroll after detach', () => {
        const { pointer, scrollBy } = create(undefined)

        pointer.detach()
        wheel()

        expect(scrollBy)
            .not.toHaveBeenCalled()
    })
})
