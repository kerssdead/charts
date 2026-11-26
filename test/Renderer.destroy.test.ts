import { createRenderer, createSettings, mockContextMenu, mockFocusRing, mockFrames, mockPointer, mockMenu, mockPanels, mockTooltip } from './RendererTestData'

describe('Destroying renderer', () => {
    it('Should clear every render dependency', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.destroy()

        expect([
            mockPointer().detach,
            mockMenu().remove,
            mockTooltip().reset,
            mockContextMenu().clear,
            mockFocusRing().clear,
            mockFrames().cancel,
            mockPanels().clear
        ].every(mock => mock.mock.calls.length > 0))
            .toBe(true)
    })
})