import ChartPanels from '@/renderer/ChartPanels'
import Layout from '@/renderer/Layout'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import Sector from '@/types/Sector'
import { ChartType, PlotType } from '@/static/Enums'
import { createSeries } from './PlotTestData'
import ViewState from '@/charts/ViewState'

jest.mock('@/Theme', () => ({}))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

function buildPanels(settings: Partial<ChartSettings>) {
    const layout = new Layout()

    layout.width = 600
    layout.height = 300
    layout.update({ title: undefined })

    const panels = new ChartPanels(new Queue({} as CanvasRenderingContext2D), layout)

    const chartSettings = { valuePostfix: undefined, ...settings } as ChartSettings
    const viewState = new ViewState()

    viewState.apply(chartSettings)
    panels.build(chartSettings, viewState, true, () => {})

    return panels.list
}

describe('Building chart panels', () => {
    it('Should give panel the value axis of its chart', () => {
        const [plot, pie] = buildPanels({
            columns: 2,
            charts: [
                { type: ChartType.Plot, data: { values: [createSeries(PlotType.Line, [0, 100])] } },
                { type: ChartType.Pie, data: { values: [new Sector({ id: 'a', value: 1, color: '#ff0000' })] } }
            ]
        })

        expect([plot.valueAxis?.getAxisValue(plot.valueAxis.getAxisY(37)), pie.valueAxis])
            .toEqual([expect.closeTo(37), null])
    })
})