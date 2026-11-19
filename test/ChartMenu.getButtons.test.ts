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

    it('Should export PNG with the ratio, title and clean frame preparation after the menu fades', () => {
        jest.useFakeTimers()

        const drawClean = jest.fn()
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), drawClean)

        menu.ratio = 2
        menu.apply(settings, () => false, DARK_THEME)
        menu.getButtons()[0].action()

        expect(Export.asPng)
            .not.toHaveBeenCalled()

        jest.runAllTimers()

        expect(Export.asPng)
            .toHaveBeenCalledWith(expect.anything(), {
                ratio: 2,
                title: 'Chart',
                exclude: undefined,
                theme: DARK_THEME,
                prepare: drawClean
            })
    })

    it('Should reuse buttons until settings are applied again', () => {
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        const buttons = menu.getButtons()

        expect(menu.getButtons())
            .toBe(buttons)

        menu.apply(settings, () => false, DARK_THEME)

        expect(menu.getButtons())
            .not.toBe(buttons)
    })

    it('Should separate export actions from the table action with a divider', () => {
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        expect(menu.getButtons().map(button => button.isDivider === true))
            .toEqual([false, false, true, false])
    })

    it('Should use the default table title and open the dialog', () => {
        const open = jest.fn()

        ;(Modal as unknown as jest.Mock).mockImplementationOnce(() => ({ open }))

        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply({ ...settings, title: '' }, () => false, DARK_THEME)
        menu.getButtons().find(item => item.text === TextResources.decomposeToTable)?.action()

        expect(Modal)
            .toHaveBeenCalledWith('table', TextResources.dataAsTable, true)
        expect(open)
            .toHaveBeenCalled()
    })

    it('Should export CSV from the table dialog', () => {
        const menu = new ChartMenu({} as HTMLCanvasElement, {} as Queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)
        menu.getButtons().find(item => item.text === TextResources.decomposeToTable)?.action()

        const exportCsv = (Decomposition.fromCharts as jest.Mock).mock.calls.at(-1)[2]

        exportCsv()

        expect(Export.asCsv)
            .toHaveBeenCalledWith(settings.charts, 'Chart')
    })
})