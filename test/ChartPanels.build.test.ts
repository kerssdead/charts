import ChartPanels from '@/renderer/ChartPanels'
import Layout from '@/renderer/Layout'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'
import { ChartType, PlotType } from '@/static/Enums'
import { ItemFlag as f } from '@/static/ItemFlag'
import { createSeries } from './PlotTestData'
import ViewState from '@/charts/ViewState'
import { Layer } from '@/static/constants/Index'
import { LIGHT_THEME } from '@/Theme'

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
    panels.build({
        settings: chartSettings,
        viewState,
        isInitialized: true,
        onChange: () => {},
        theme: LIGHT_THEME
    })

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

    it('Should add a scrollbar for a tree bar chart', () => {
        const layout = new Layout()

        layout.width = 600
        layout.height = 300
        layout.update({ title: undefined })

        const queue = new Queue({} as CanvasRenderingContext2D)
        const panels = new ChartPanels(queue, layout)

        const chartSettings = {
            charts: [{
                type: ChartType.TreeBar,
                data: {
                    values: [new TreeBarRow({
                        id: 'a',
                        label: 'A',
                        value: 1,
                        parts: [new Sector({ id: 'p', value: 1, color: '#ff0000' })]
                    })]
                }
            }]
        } as unknown as ChartSettings

        const viewState = new ViewState()

        viewState.apply(chartSettings)
        panels.build({
        settings: chartSettings,
        viewState,
        isInitialized: true,
        onChange: () => {},
        theme: LIGHT_THEME
    })

        const scrollbar = queue.items.find(item => item.layer === Layer.Scrollbar)

        expect(scrollbar)
            .toBeDefined()
        expect(scrollbar?.is(f.Fixed))
            .toBe(true)
    })

    it('Should build an empty panel for an unknown chart', () => {
        const panels = buildPanels({
            charts: [{ type: 'Unknown' as unknown as ChartType, data: { values: [] } }]
        })

        expect(panels)
            .toHaveLength(1)
    })

    it('Should show the empty state for a chart without values', () => {
        const layout = new Layout()

        layout.width = 600
        layout.height = 300
        layout.update({ title: undefined })

        const queue = new Queue({} as CanvasRenderingContext2D)
        const panels = new ChartPanels(queue, layout)

        const chartSettings = {
            charts: [{ type: ChartType.Plot, data: { values: [createSeries(PlotType.Line, [])] } }]
        } as unknown as ChartSettings

        const viewState = new ViewState()

        viewState.apply(chartSettings)
        panels.build({
        settings: chartSettings,
        viewState,
        isInitialized: true,
        onChange: () => {},
        theme: LIGHT_THEME
    })

        const empty = queue.items.find(item => item.key === 'empty')

        expect(empty)
            .toBeDefined()
    })
})