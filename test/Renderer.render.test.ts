import { createRenderer, mockFrames } from './RendererTestData'

describe('Rendering renderer', () => {
    it('Should request a frame', () => {
        const { renderer } = createRenderer()

        renderer.render()

        expect(mockFrames().request)
            .toHaveBeenCalled()
    })
})
