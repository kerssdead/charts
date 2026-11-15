import { createRenderer, createSettings, mockFrames, mockInput } from './RendererTestData'

describe('Resuming renderer', () => {
    it('Should attach inputs and resume frames', () => {
        const { renderer } = createRenderer()
        const settings = createSettings({ enableMove: true })

        renderer.apply(settings)
        renderer.suspend()

        const input = mockInput()

        input.attach.mockClear()
        renderer.resume()

        expect(input.attach)
            .toHaveBeenCalledWith(true)
        expect(mockFrames().resume)
            .toHaveBeenCalled()
    })
})