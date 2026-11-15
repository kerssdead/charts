import ChartMenu from '@/renderer/ChartMenu'
import Export from '@/export/Export'
import Modal from '@/ui/Modal'
import Decomposition from '@/export/Decomposition'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import TextResources from '@/static/TextResources'
import { ChartType } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

jest.mock('@/export/Export', () => ({
    __esModule: true,
    default: { asPng: jest.fn(), asCsv: jest.fn() }
}))

jest.mock('@/ui/Modal', () => ({
    __esModule: true,
    default: jest.fn(() => ({ open: jest.fn() }))
}))

jest.mock('@/export/Decomposition', () => ({
    __esModule: true,
    default: { fromCharts: jest.fn(() => 'table') }
}))

const settings = {
    title: 'Chart',
    decimals: 2,
    charts: [{ type: ChartType.Plot, data: { values: [] } }]
} as unknown as ChartSettings

describe('Getting chart menu buttons', () => {
    afterEach(() => {
        jest.useRealTimers()
        jest.clearAllMocks()
    })

    it('Should pass the theme to PNG export', () => {
        jest.useFakeTimers()

        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        const button = menu.getButtons().find(item => item.text === TextResources.exportPNG)

        button?.action()
        jest.runAllTimers()

        expect(Export.asPng)
            .toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ theme: DARK_THEME })
            )
    })

    it('Should export CSV with the chart data', () => {
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        const button = menu.getButtons().find(item => item.text === TextResources.exportCSV)

        button?.action()

        expect(Export.asCsv)
            .toHaveBeenCalledWith(settings.charts, settings.title)
    })

    it('Should pass the dark flag to the table dialog', () => {
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        const button = menu.getButtons().find(item => item.text === TextResources.decomposeToTable)

        button?.action()

        expect(Decomposition.fromCharts)
            .toHaveBeenCalled()
        expect(Modal)
            .toHaveBeenCalledWith('table', 'Chart', true)
    })
})