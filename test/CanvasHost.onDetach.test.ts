import CanvasHost from '@/renderer/CanvasHost'
import { installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Reporting canvas host detach', () => {
    it('Should report detach when the canvas leaves the page', () => {
        const { environment, events, host } = create()

        host.canvas.remove()
        environment.resizeElement(100, 50)

        expect(events.onDetach)
            .toHaveBeenCalledTimes(1)
    })

    it('Should stop watching pixel ratio while detached', () => {
        const { environment, events, host } = create()

        environment.resizeElement(100, 50)
        host.canvas.remove()
        environment.resizeElement(100, 50)
        events.onResize.mockClear()
        environment.changeRatio(2)

        expect(events.onResize)
            .not.toHaveBeenCalled()
    })

    it('Should not resize a detached canvas', () => {
        const { environment, events, host } = create()

        host.canvas.remove()
        environment.resizeElement(100, 50)

        expect(events.onResize)
            .not.toHaveBeenCalled()
        expect(events.onAttach)
            .not.toHaveBeenCalled()
    })
})