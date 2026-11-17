import {
    createRenderer,
    createSettings,
    mockContextMenu,
    mockFrames,
    mockFramesScene,
    mockInput,
    mockMenu,
    mockPanels
} from './RendererTestData'
import ChartMenu from '@/renderer/ChartMenu'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import InputRouter from '@/renderer/InputRouter'
import Legend from '@/legend/Legend'
import Sector from '@/types/Sector'
import { onImageLoad } from '@/helpers/Images'

const lastArgs = (mock: unknown) => (mock as jest.Mock).mock.calls.at(-1)

describe('Creating renderer', () => {
    it('Should open the input menu from the menu button', () => {
        createRenderer()

        lastArgs(ChartMenu)[2]({ x: 1, y: 2 })

        expect(mockInput().openMenu)
            .toHaveBeenCalledWith({ x: 1, y: 2 })
    })

    it('Should draw clean frame when the menu asks for it', () => {
        createRenderer()

        lastArgs(ChartMenu)[3]()

        expect(mockFrames().drawClean)
            .toHaveBeenCalled()
    })

    it('Should close the context from the context menu', () => {
        createRenderer()

        lastArgs(ContextMenuOverlay)[1]()

        expect(mockInput().closeContext)
            .toHaveBeenCalled()
    })

    it('Should report context menu action errors', () => {
        const { onError } = createRenderer()
        const error = new Error('failed')

        lastArgs(ContextMenuOverlay)[2](() => {
            throw error
        })

        expect(onError)
            .toHaveBeenCalledWith(error)
    })

    it('Should provide menu buttons as fixed context menu buttons', () => {
        createRenderer()

        expect(mockContextMenu().fixedButtons())
            .toBe(mockMenu().getButtons.mock.results[0].value)
    })

    it('Should render when input changes', () => {
        createRenderer()

        lastArgs(InputRouter)[1].onChange()

        expect(mockFrames().request)
            .toHaveBeenCalled()
    })

    it('Should give input the current settings', () => {
        const { renderer } = createRenderer()
        const settings = createSettings()

        renderer.apply(settings)

        expect(lastArgs(InputRouter)[1].getSettings())
            .toBe(settings)
        expect(mockFramesScene?.getSettings())
            .toBe(settings)
    })

    it('Should sync theme for frames', () => {
        createRenderer()

        expect(mockFramesScene?.syncTheme())
            .toBe(false)
    })

    it('Should rebuild panels animated when the theme changes', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 1)
        renderer.apply(createSettings())
        mockPanels().build.mockClear()
        mockFramesScene?.rebuildForTheme()

        expect(mockPanels().build)
            .toHaveBeenCalledWith(expect.objectContaining({ isInitialized: true }))
    })

    it('Should render when an image is loaded', () => {
        createRenderer()

        const onLoad = (onImageLoad as jest.Mock).mock.calls.at(-1)[0]

        onLoad()

        expect(mockFrames().request)
            .toHaveBeenCalled()
    })

    it('Should tell the menu which values are disabled', () => {
        const { renderer, viewState } = createRenderer()
        const value = new Sector({ id: 'a', value: 1 })

        renderer.apply(createSettings())
        viewState.toggleDisabled(value)

        expect(mockMenu().apply.mock.calls[0][1](value))
            .toBe(true)
    })

    it('Should rebuild panels animated when the legend changes', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 1)
        renderer.apply(createSettings({ enableLegend: true }))
        mockPanels().build.mockClear()
        lastArgs(Legend)[2]()

        expect(mockPanels().build)
            .toHaveBeenCalledWith(expect.objectContaining({ isInitialized: true }))
    })
})