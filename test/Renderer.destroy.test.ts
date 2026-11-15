import { createRenderer, createSettings, mockContextMenu, mockFrames, mockInput, mockMenu, mockPanels, mockTooltip } from './RendererTestData'

describe('Destroying renderer', () => {
    it('Should clear every render dependency', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.destroy()

        expect([
            mockInput().detach,
            mockMenu().remove,
            mockTooltip().reset,
            mockContextMenu().clear,
            mockFrames().cancel,
            mockPanels().clear
        ].every(mock => mock.mock.calls.length > 0))
            .toBe(true)
    })
})