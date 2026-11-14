import CanvasHost from '@/renderer/CanvasHost'
import { installResizeEnvironment, removeResizeEnvironment } from './FakeResizeEnvironment'

const create = (ratio: number = 1) => {
    const environment = installResizeEnvironment(ratio)
    const events = { onResize: jest.fn(), onDetach: jest.fn(), onAttach: jest.fn() }
    const host = new CanvasHost(environment.element as unknown as HTMLElement, events)

    return { environment, events, host }
}

afterEach(removeResizeEnvironment)

describe('Checking whether canvas host is attached', () => {
    it('Should be attached while the canvas is in the page', () => {
        expect(create().host.isAttached)
            .toBe(true)
    })

    it('Should be detached after the canvas leaves the page', () => {
        const { host } = create()

        host.canvas.remove()

        expect(host.isAttached)
            .toBe(false)
    })
})