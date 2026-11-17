import PointerWheel from '@/renderer/PointerWheel'
import { event, installPointerEnvironment } from './PointerTestData'

installPointerEnvironment()

const POINT = { x: 10, y: 20 }

const wheel = ({ timeStamp = 0, ...fields }: Record<string, unknown>) => {
    const result = event('wheel', { deltaMode: 0, ...fields }, true)

    Object.defineProperty(result, 'timeStamp', { value: timeStamp })

    return result as unknown as WheelEvent
}

const createWheel = (isZoomEnabled = true) => {
    const handlers = {
        isZoomEnabled: jest.fn(() => isZoomEnabled),
        zoom: jest.fn(() => true),
        scrollBy: jest.fn((): boolean | null => true),
        onChange: jest.fn()
    }

    return { handlers, target: new PointerWheel(handlers) }
}

describe('Handling the mouse wheel', () => {
    it('Should zoom with ctrl pressed', () => {
        const { handlers, target } = createWheel()
        const zoomEvent = wheel({ deltaY: -100, ctrlKey: true })

        target.handle(zoomEvent, POINT)

        expect(handlers.zoom)
            .toHaveBeenCalledWith(expect.any(Number), POINT)
        expect(handlers.onChange)
            .toHaveBeenCalled()
        expect(zoomEvent.defaultPrevented)
            .toBe(true)
    })

    it('Should zoom with meta pressed', () => {
        const { handlers, target } = createWheel()

        target.handle(wheel({ deltaY: -100, metaKey: true }), POINT)

        expect(handlers.zoom)
            .toHaveBeenCalled()
    })

    it('Should zoom in with a negative delta and out with a positive one', () => {
        const { handlers, target } = createWheel()

        target.handle(wheel({ deltaY: -100, ctrlKey: true }), POINT)
        target.handle(wheel({ deltaY: 100, ctrlKey: true }), POINT)

        const [zoomIn, zoomOut] = handlers.zoom.mock.calls.map(call => (call as unknown as number[])[0])

        expect(zoomIn)
            .toBeGreaterThan(0)
        expect(zoomOut)
            .toBe(-zoomIn)
    })

    it('Should not zoom when zooming is disabled', () => {
        const { handlers, target } = createWheel(false)
        const zoomEvent = wheel({ deltaY: -100, ctrlKey: true })

        target.handle(zoomEvent, POINT)

        expect(handlers.zoom)
            .not.toHaveBeenCalled()
        expect(zoomEvent.defaultPrevented)
            .toBe(false)
    })

    it('Should not report a change when the zoom changes nothing', () => {
        const { handlers, target } = createWheel()

        handlers.zoom.mockReturnValue(false)

        target.handle(wheel({ deltaY: -100, ctrlKey: true }), POINT)

        expect(handlers.onChange)
            .not.toHaveBeenCalled()
    })

    it('Should scroll without a modifier', () => {
        const { handlers, target } = createWheel()
        const scrollEvent = wheel({ deltaY: 100 })

        target.handle(scrollEvent, POINT)

        expect(handlers.scrollBy)
            .toHaveBeenCalledWith(POINT, 100)
        expect(handlers.onChange)
            .toHaveBeenCalled()
        expect(scrollEvent.defaultPrevented)
            .toBe(true)
    })

    it('Should convert line deltas to pixels', () => {
        const { handlers, target } = createWheel()

        target.handle(wheel({ deltaY: 2, deltaMode: 1 }), POINT)

        expect(handlers.scrollBy)
            .toHaveBeenCalledWith(POINT, 32)
    })

    it('Should ignore a zero delta', () => {
        const { handlers, target } = createWheel()

        target.handle(wheel({ deltaY: 0 }), POINT)

        expect(handlers.scrollBy)
            .not.toHaveBeenCalled()
    })

    it('Should leave the event alone when nothing can be scrolled', () => {
        const { handlers, target } = createWheel()
        const scrollEvent = wheel({ deltaY: 100 })

        handlers.scrollBy.mockReturnValue(null)

        target.handle(scrollEvent, POINT)

        expect(scrollEvent.defaultPrevented)
            .toBe(false)
    })

    it('Should keep blocking the page scroll shortly after a scroll reached the end', () => {
        const { handlers, target } = createWheel()

        target.handle(wheel({ deltaY: 100, timeStamp: 1000 }), POINT)
        handlers.scrollBy.mockReturnValue(false)

        const latched = wheel({ deltaY: 100, timeStamp: 1100 })
        const released = wheel({ deltaY: 100, timeStamp: 2000 })

        target.handle(latched, POINT)
        target.handle(released, POINT)

        expect(latched.defaultPrevented)
            .toBe(true)
        expect(released.defaultPrevented)
            .toBe(false)
    })
})