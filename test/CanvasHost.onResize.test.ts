import CanvasHost from '@/renderer/CanvasHost'
import { installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Reporting canvas host resize', () => {
    it('Should size the canvas by pixel ratio and report css size with the ratio', () => {
        const { environment, events, host } = create(2)
        const canvas = host.canvas

        environment.resizeElement(100.7, 50.2)

        expect([canvas.width, canvas.height, canvas.style.width, canvas.style.height])
            .toEqual([200, 100, '100px', '50px'])
        expect(events.onResize)
            .toHaveBeenCalledWith(100, 50, 2)
    })

    it('Should ignore an empty size', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 0)

        expect(events.onResize)
            .not.toHaveBeenCalled()
    })

    it('Should ignore an unchanged size', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 50)
        environment.resizeElement(100.4, 50.4)

        expect(events.onResize)
            .toHaveBeenCalledTimes(1)
    })

    it('Should use exact device pixels of the canvas', () => {
        const { environment, events, host } = create(1.5)

        environment.resizeElement(101, 51)
        environment.observer.notify([{
            target: host.canvas,
            devicePixelContentBoxSize: [{ inlineSize: 151, blockSize: 77 }]
        }])

        expect([host.canvas.width, host.canvas.height])
            .toEqual([151, 77])
        expect(events.onResize)
            .toHaveBeenLastCalledWith(101, 51, 151 / 101)
    })

    it('Should report again when the pixel ratio changes', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 50)
        environment.changeRatio(2)

        expect(events.onResize)
            .toHaveBeenLastCalledWith(100, 50, 2)
    })

    it('Should keep watching after a pixel ratio change', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 50)
        environment.changeRatio(2)
        environment.changeRatio(1.5)

        expect(events.onResize)
            .toHaveBeenLastCalledWith(100, 50, 1.5)
    })

    it('Should cap the pixel ratio at two', () => {
        const { environment, events, host } = create(3)

        environment.resizeElement(100, 50)

        expect([host.canvas.width, host.canvas.height])
            .toEqual([200, 100])
        expect(events.onResize)
            .toHaveBeenCalledWith(100, 50, 2)
    })

    it('Should fall back to a ratio of one when the browser reports none', () => {
        const { environment, events } = create(0)

        environment.resizeElement(100, 50)

        expect(events.onResize)
            .toHaveBeenCalledWith(100, 50, 1)
    })
})