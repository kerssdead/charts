import { createRenderer, createSettings, mockContextMenu, mockFrames, mockInput, mockTooltip } from './RendererTestData'

describe('Suspending renderer', () => {
    it('Should detach inputs and clear transient overlays', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.suspend()

        expect(mockInput().detach)
            .toHaveBeenCalled()
        expect(mockTooltip().clear)
            .toHaveBeenCalled()
        expect(mockContextMenu().clear)
            .toHaveBeenCalled()
        expect(mockFrames().suspend)
            .toHaveBeenCalled()
    })
})