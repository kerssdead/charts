import CanvasHost from '@/renderer/CanvasHost'
import { installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Getting canvas host size', () => {
    it('Should be empty before the first resize', () => {
        expect(create().host.size)
            .toEqual({ width: 0, height: 0 })
    })

    it('Should be the last css size in whole pixels', () => {
        const { environment, host } = create(2)

        environment.resizeElement(100.7, 50.2)

        expect(host.size)
            .toEqual({ width: 100, height: 50 })
    })

    it('Should keep the last size after the host is destroyed', () => {
        const { environment, host } = create()

        environment.resizeElement(100, 50)
        host.destroy()

        expect(host.size)
            .toEqual({ width: 100, height: 50 })
    })
})