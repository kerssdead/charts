import CanvasHost from '@/renderer/CanvasHost'
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

    it('Should not report detach for a connected canvas', () => {
        const { environment, events } = create()

        environment.resizeElement(100, 50)

        expect(events.onDetach)
            .not.toHaveBeenCalled()
    })
})