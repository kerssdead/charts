import Renderer from '@/renderer/Renderer'
import ChartPanels from '@/renderer/ChartPanels'
import ChartMenu from '@/renderer/ChartMenu'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import InputRouter from '@/renderer/InputRouter'
import Frames from '@/renderer/Frames'
import Legend from '@/legend/Legend'
import ViewState from '@/charts/ViewState'
import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { ThemePalette } from '@/Theme'
import { DARK_THEME } from './TestTheme'

export let mockFramesScene: {
    getThemePalette: () => ThemePalette
    syncTheme: () => boolean
    rebuildForTheme: () => void
    getLegend: () => unknown
    getOverlays: () => unknown[]
    getSettings: () => ChartSettings
} | null = null

jest.mock('@/helpers/Canvas', () => ({
    ...jest.requireActual('@/helpers/Canvas'),
    getContext: () => ({}) as CanvasRenderingContext2D
}))

jest.mock('@/helpers/Images', () => ({
    onImageLoad: jest.fn(() => () => {})
}))

jest.mock('@/renderer/ChartPanels', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        list: [],
        canScroll: false,
        build: jest.fn(),
        animate: jest.fn(() => false),
        clear: jest.fn()
    }))
}))

jest.mock('@/renderer/ChartMenu', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        button: undefined,
        ratio: 1,
        apply: jest.fn(),
        remove: jest.fn(),
        getButtons: jest.fn(() => [])
    }))
}))

jest.mock('@/renderer/TooltipOverlay', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        apply: jest.fn(),
        reset: jest.fn(),
        clear: jest.fn(),
        update: jest.fn(() => false)
    }))
}))

jest.mock('@/renderer/ContextMenuOverlay', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        menu: undefined,
        fixedButtons: undefined,
        clear: jest.fn(),
        update: jest.fn(() => false)
    }))
}))

jest.mock('@/renderer/InputRouter', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        attach: jest.fn(),
        detach: jest.fn(),
        closeContext: jest.fn(),
        setScrollable: jest.fn(),
        openMenu: jest.fn(),
        position: null,
        context: null
    }))
}))

jest.mock('@/legend/Legend', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        reservedPaddings: { left: 0, top: 0, right: 0, bottom: 0 },
        resize: jest.fn(),
        applySettings: jest.fn(),
        destroy: jest.fn(),
        clear: jest.fn()
    }))
}))

jest.mock('@/renderer/Frames', () => ({
    __esModule: true,
    default: jest.fn((scene: typeof mockFramesScene) => {
        mockFramesScene = scene

        return {
            request: jest.fn(),
            cancel: jest.fn(),
            drawNow: jest.fn(),
            drawClean: jest.fn(),
            suspend: jest.fn(),
            resume: jest.fn(),
            isSuspended: false
        }
    })
}))

const lastResult = (mock: unknown) => {
    return (mock as jest.Mock).mock.results.at(-1)?.value
}

export const mockMenu = () => lastResult(ChartMenu)
export const mockPanels = () => lastResult(ChartPanels)
export const mockPanelsQueue = () => (ChartPanels as unknown as jest.Mock).mock.calls.at(-1)[0]
export const mockTooltip = () => lastResult(TooltipOverlay)
export const mockContextMenu = () => lastResult(ContextMenuOverlay)
export const mockInput = () => lastResult(InputRouter)
export const mockLegend = () => lastResult(Legend)
export const mockFrames = () => lastResult(Frames)

export const createSettings = (overrides: Partial<ChartSettings> = {}) => {
    return {
        title: 'Chart',
        enableLegend: false,
        enableTooltip: false,
        enableMove: false,
        staticMode: false,
        disableInteractions: false,
        disableMenu: false,
        charts: [{ type: ChartType.Plot, data: { values: [] } }],
        ...overrides
    } as ChartSettings
}

export const createRenderer = (theme: ThemePalette = DARK_THEME) => {
    mockFramesScene = null

    const viewState = new ViewState()
    const onError = jest.fn()
    const renderer = new Renderer(
        {} as HTMLCanvasElement,
        viewState,
        { getPalette: () => theme, sync: () => false },
        onError
    )

    return { renderer, viewState, theme, onError }
}