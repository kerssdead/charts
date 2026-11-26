import { createRenderer, createSettings, mockFrames, mockPointer } from './RendererTestData'
import { onImageLoad } from '@/helpers/Images'

describe('Resuming renderer', () => {
    it('Should attach inputs and resume frames', () => {
        const { renderer } = createRenderer()
        const settings = createSettings({ enableMove: true })

        renderer.apply(settings)
        renderer.suspend()

        const pointer = mockPointer()

        pointer.attach.mockClear()
        renderer.resume()

        expect(pointer.attach)
            .toHaveBeenCalledWith(true)
        expect(mockFrames().resume)
            .toHaveBeenCalled()
    })

    it('Should render again when an image loads after resuming', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.suspend()
        renderer.resume()

        const frames = mockFrames()
        const [onLoad] = jest.mocked(onImageLoad).mock.calls.at(-1) ?? []

        frames.request.mockClear()
        onLoad?.()

        expect(frames.request)
            .toHaveBeenCalled()
    })
})