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

describe('Destroying canvas host', () => {
    it('Should remove the canvas', () => {
        const { environment, host } = create()

        host.destroy()

        expect(environment.element.elements)
            .toEqual([])
    })

    it('Should stop observing resizes', () => {
        const { environment, host } = create()

        host.destroy()

        expect(environment.observer.isDisconnected)
            .toBe(true)
    })

    it('Should stop watching pixel ratio', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        events.onResize.mockClear()
        host.destroy()
        environment.changeRatio(2)

        expect(events.onResize)
            .not.toHaveBeenCalled()
    })

    it('Should stop observing viewport visibility and printing', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        environment.setInViewport(false)
        host.destroy()
        events.onAttach.mockClear()
        environment.dispatchWindowEvent(PrintEvents.Before)

        expect(environment.visibility.isDisconnected)
            .toBe(true)
        expect(events.onAttach)
            .not.toHaveBeenCalled()
    })
})