import { ChartClasses } from '@/static/Enums'
import CanvasHost from '@/renderer/CanvasHost'
import { FakeResizeObserver, installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Creating canvas host', () => {
    it('Should append a canvas to the element', () => {
        const { environment, host } = create()

        expect(environment.element.elements)
            .toEqual([host.canvas])
    })

    it('Should observe the element and the canvas', () => {
        const { environment, host } = create()

        expect(environment.observer.targets)
            .toEqual([environment.element, host.canvas])
    })

    it('Should still observe the element without device pixel box support', () => {
        const environment = installResizeEnvironment()
        const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }

        FakeResizeObserver.supportsDevicePixels = false

        expect(() => new CanvasHost(environment.element as unknown as HTMLElement, events))
            .not.toThrow()
        expect(environment.observer.targets)
            .toEqual([environment.element])
    })

    it('Should mark the canvas for styling', () => {
        const { host } = create()

        expect(host.canvas.classList.contains(ChartClasses.Canvas))
            .toBe(true)
    })
})