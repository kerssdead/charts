import { createRenderer, createSettings, mockFramesScene, mockMenu, mockPanels } from './RendererTestData'
import { DARK_THEME } from './TestTheme'

describe('Applying renderer settings', () => {
    it('Should pass the current palette into menus, panels and frames', () => {
        const { renderer } = createRenderer()
        const settings = createSettings()

        renderer.apply(settings)
        renderer.resize(600, 300, 1)

        expect(mockMenu().apply)
            .toHaveBeenCalledWith(settings, expect.any(Function), DARK_THEME)
        expect(mockPanels().build)
            .toHaveBeenCalledWith(expect.objectContaining({
                settings,
                isInitialized: false,
                theme: DARK_THEME
            }))
        expect(mockFramesScene?.getThemePalette())
            .toBe(DARK_THEME)
    })
})