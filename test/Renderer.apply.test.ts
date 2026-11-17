import {
    createRenderer,
    createSettings,
    mockContextMenu,
    mockFrames,
    mockFramesScene,
    mockInput,
    mockLegend,
    mockMenu,
    mockPanels,
    mockTooltip
} from './RendererTestData'
import Legend from '@/legend/Legend'
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

    it('Should pass settings to the tooltip and context menu', () => {
        const { renderer } = createRenderer()
        const settings = createSettings({ contextMenu: [{ text: 'Run', action: () => {} }] })

        renderer.apply(settings)

        expect(mockTooltip().apply)
            .toHaveBeenCalledWith(settings)
        expect(mockContextMenu().menu)
            .toBe(settings.contextMenu)
    })

    it('Should attach input with the move setting', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings({ enableMove: true }))

        expect(mockInput().attach)
            .toHaveBeenCalledWith(true)
    })

    it('Should not attach input while frames are suspended', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        mockFrames().isSuspended = true
        mockInput().attach.mockClear()
        renderer.apply(createSettings())

        expect(mockInput().attach)
            .not.toHaveBeenCalled()
    })

    it('Should build panels only when the layout has an area', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())

        expect(mockPanels().build)
            .not.toHaveBeenCalled()
        expect(mockPanels().clear)
            .toHaveBeenCalled()
    })

    it('Should rebuild initialized panels on repeated apply', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 1)
        renderer.apply(createSettings())
        renderer.apply(createSettings())

        expect(mockPanels().build)
            .toHaveBeenLastCalledWith(expect.objectContaining({ isInitialized: true }))
    })

    it('Should rebuild initialized panels in static mode', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 1)
        renderer.apply(createSettings({ staticMode: true }))
        renderer.apply(createSettings({ staticMode: true }))

        expect(mockPanels().build)
            .toHaveBeenLastCalledWith(expect.objectContaining({ isInitialized: true }))
    })

    it('Should let panels request an animated rebuild', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 1)
        renderer.apply(createSettings())

        const build = mockPanels().build

        build.mock.calls[0][0].onChange()

        expect(build)
            .toHaveBeenCalledTimes(2)
    })

    it('Should create the legend once and reapply settings to it', () => {
        const { renderer } = createRenderer()

        const settings = createSettings({ enableLegend: true })

        renderer.apply(settings)
        renderer.apply(settings)

        expect(mockLegend().applySettings)
            .toHaveBeenCalledWith(settings)
        expect(Legend)
            .toHaveBeenCalledTimes(1)
    })

    it('Should remove the legend when it is disabled', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings({ enableLegend: true }))

        const legend = mockLegend()

        renderer.apply(createSettings({ enableLegend: false }))

        expect(legend.destroy)
            .toHaveBeenCalled()
        expect(mockFramesScene?.getLegend())
            .toBeUndefined()
    })

    it('Should set tooltip and context menu overlays for frames', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())

        expect(mockFramesScene?.getOverlays())
            .toEqual([mockTooltip(), mockContextMenu()])
    })
})