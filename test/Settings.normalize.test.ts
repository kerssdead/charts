import { normalize } from '@/helpers/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import PlotSeries from '@/types/PlotSeries'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'

const FALLBACK = '#808080'

describe('Normalizing settings', () => {
    it('Should convert legacy type and data to charts', () => {
        const settings = normalize({ type: ChartType.Pie, data: { values: [] } } as unknown as ChartSettings, FALLBACK)

        expect(settings.charts.map(chart => chart.type))
            .toEqual([ChartType.Pie])
    })

    it('Should default chart type to plot', () => {
        const settings = normalize({ charts: [{ data: { values: [] } }] } as unknown as ChartSettings, FALLBACK)

        expect(settings.charts[0].type)
            .toBe(ChartType.Plot)
    })

    it('Should not mutate source', () => {
        const source = { type: ChartType.Pie, data: { values: [{ value: '5' }] } } as unknown as ChartSettings

        normalize(source, FALLBACK)

        expect(source.data.values[0].value)
            .toBe('5')
    })

    it('Should wrap values and assign labels and ids', () => {
        const settings = normalize({
            charts: [
                { type: ChartType.Pie, data: { values: [{ value: 1 }, { value: 2 }] } },
                { type: ChartType.Plot, data: { values: [{ values: [] }] } }
            ]
        } as unknown as ChartSettings, FALLBACK)

        const [pie, plot] = settings.charts.map(chart => chart.data.values)

        expect(pie[0])
            .toBeInstanceOf(Sector)
        expect(plot[0])
            .toBeInstanceOf(PlotSeries)
        expect(pie.map(value => value.id))
            .toEqual([`${ TextResources.noLabel }-0`, `${ TextResources.noLabel }-1`])
    })

    it('Should parse numbers and replace invalid with 0', () => {
        const settings = normalize({
            charts: [
                { type: ChartType.Pie, data: { values: [{ label: 'A', value: '12' }, { label: 'B', value: 'abc' }] } },
                { type: ChartType.Plot, data: { values: [{ label: 'C', values: [{ x: 1, y: '3.5' }] }] } }
            ]
        } as unknown as ChartSettings, FALLBACK)

        const [pie, plot] = settings.charts.map(chart => chart.data.values)

        expect(pie.map(value => value.value))
            .toEqual([12, 0])
        expect((plot[0] as PlotSeries).values[0].y)
            .toBe(3.5)
    })

    it('Should disable tooltip and legend when not applicable', () => {
        const settings = normalize({
            type: ChartType.Gauge,
            data: { values: [{ value: 1 }] },
            enableTooltip: true,
            enableLegend: true,
            disableInteractions: true
        } as unknown as ChartSettings, FALLBACK)

        expect([settings.enableTooltip, settings.enableLegend])
            .toEqual([false, false])
    })
})