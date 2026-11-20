import CanvasHost from '@/renderer/CanvasHost'
import { PrintEvents } from '@/static/Enums'
import { installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Reporting canvas host attach', () => {
    it('Should report attach before resizing a connected canvas', () => {
        const { environment, events } = create()
        const calls: string[] = []

        events.onAttach.mockImplementation(() => calls.push('attach'))
        events.onResize.mockImplementation(() => calls.push('resize'))

        environment.resizeElement(100, 50)

        expect(calls)
            .toEqual(['attach', 'resize'])
    })

    it('Should watch pixel ratio again after reattaching', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        host.canvas.remove()
        environment.resizeElement(100, 50)
        environment.element.appendChild(host.canvas as never)
        environment.resizeElement(100, 50)
        events.onResize.mockClear()
        environment.changeRatio(2)

        expect(events.onResize)
            .toHaveBeenCalledWith(100, 50, 2)
    })

    it('Should not report detach for a connected canvas', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 50)

        expect(events.onDetach)
            .not.toHaveBeenCalled()
    })

    it('Should report attach and redraw at the kept size when the chart returns to the viewport', () => {
        const { environment, events, host } = create(2)
        const calls: string[] = []

        environment.resizeElement(100, 50)
        environment.setInViewport(false)
        events.onAttach.mockImplementation(() => calls.push('attach'))
        events.onResize.mockImplementation((...args: number[]) => calls.push(`resize ${ args.join(' ') }`))
        environment.setInViewport(true)

        expect(calls)
            .toEqual(['attach', 'resize 100 50 2'])
        expect([host.canvas.width, host.canvas.height])
            .toEqual([200, 100])
    })

    it('Should not report attach or allocate pixels when resized out of the viewport', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        environment.setInViewport(false)
        events.onAttach.mockClear()
        environment.resizeElement(120, 60)

        expect(events.onAttach)
            .not.toHaveBeenCalled()
        expect([host.canvas.width, host.canvas.height, host.canvas.style.width])
            .toEqual([0, 0, '120px'])
    })

    it('Should restore canvas pixels before printing an out-of-viewport chart', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        environment.setInViewport(false)
        events.onAttach.mockClear()
        environment.dispatchWindowEvent(PrintEvents.Before)

        expect(events.onAttach)
            .toHaveBeenCalledTimes(1)
        expect([host.canvas.width, host.canvas.height])
            .toEqual([100, 50])
    })
})