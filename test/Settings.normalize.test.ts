import { normalize } from '@/helpers/Settings'
import { ChartType, PlotAxisType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import PlotSeries from '@/types/PlotSeries'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'
import SegmentedBarData from '@/types/data/SegmentedBarData'

describe('Normalizing settings', () => {
    it('Should convert legacy type and data to charts', () => {
        const settings = normalize({ type: ChartType.Pie, data: { values: [] } } as unknown as ChartSettings)

        expect(settings.charts.map(chart => chart.type))
            .toEqual([ChartType.Pie])
    })

    it('Should default chart type to plot', () => {
        const settings = normalize({ charts: [{ data: { values: [] } }] } as unknown as ChartSettings)

        expect(settings.charts[0].type)
            .toBe(ChartType.Plot)
    })

    it('Should not mutate source', () => {
        const source = { type: ChartType.Pie, data: { values: [{ value: '5' }] } } as unknown as ChartSettings

        normalize(source)

        expect(source.data.values[0].value)
            .toBe('5')
    })

    it('Should wrap values and assign labels and ids', () => {
        const settings = normalize({
            charts: [
                { type: ChartType.Pie, data: { values: [{ value: 1 }, { value: 2 }], enableMerging: false } },
                { type: ChartType.Plot, data: { values: [{ values: [] }] } }
            ]
        } as unknown as ChartSettings)

        const [pie, plot] = settings.charts.map(chart => chart.data.values)

        expect(pie[0])
            .toBeInstanceOf(Sector)
        expect(plot[0])
            .toBeInstanceOf(PlotSeries)
        expect(pie.map(value => value.id))
            .toEqual([`${ TextResources.noLabel }-0`, `${ TextResources.noLabel }-1`])
    })

    it('Should merge same label sectors after parsing numbers', () => {
        const settings = normalize({
            type: ChartType.Pie,
            data: { values: [{ label: 'A', value: '1' }, { label: 'A', value: '2' }] }
        } as unknown as ChartSettings)

        expect(settings.charts[0].data.values.map(value => value.value))
            .toEqual([3])
    })

    it('Should parse numbers and replace invalid with null', () => {
        const settings = normalize({
            charts: [
                {
                    type: ChartType.Pie,
                    data: {
                        values: [
                            { label: 'A', value: '12' },
                            { label: 'B', value: 'abc' },
                            { label: 'C', value: '' },
                            { label: 'D', value: NaN }
                        ]
                    }
                },
                { type: ChartType.Plot, data: { values: [{ label: 'E', values: [{ x: 1, y: '3.5' }] }] } }
            ]
        } as unknown as ChartSettings)

        const [pie, plot] = settings.charts.map(chart => chart.data.values)

        expect(pie.map(value => value.value))
            .toEqual([12, null, null, null])
        expect((plot[0] as PlotSeries).values[0].y)
            .toBe(3.5)
    })

    it('Should parse values, points and stops with number locale', () => {
        const settings = normalize({
            numberLocale: 'de-DE',
            charts: [
                { type: ChartType.Pie, data: { values: [{ label: 'A', value: '1.234,5' }] } },
                { type: ChartType.Plot, data: { values: [{ label: 'B', values: [{ x: 1, y: '2.000' }] }] } },
                { type: ChartType.SegmentedBar, data: { values: [{ value: 1 }], stops: [{ value: '12,5%' }] } }
            ]
        } as unknown as ChartSettings)

        const [pie, plot, segmentedBar] = settings.charts.map(chart => chart.data)

        expect(pie.values[0].value)
            .toBe(1234.5)
        expect((plot.values[0] as PlotSeries).values[0].y)
            .toBe(2000)
        expect((segmentedBar as SegmentedBarData).stops[0].value)
            .toBe(12.5)
    })

    it('Should replace missing and invalid y with null', () => {
        const ys = [undefined, null, '', 'N/A', NaN, Infinity, -Infinity, '1 000', 0]
        const settings = normalize({
            type: ChartType.Plot,
            data: { values: [{ label: 'A', values: ys.map((y, x) => ({ x, y })) }] }
        } as unknown as ChartSettings)

        expect((settings.charts[0].data.values[0] as PlotSeries).values.map(point => point.y))
            .toEqual([null, null, null, null, null, null, null, 1000, 0])
    })

    it('Should replace a point without y with null', () => {
        const settings = normalize({
            type: ChartType.Plot,
            data: { values: [{ label: 'A', values: [{ x: 1 }] }] }
        } as unknown as ChartSettings)

        expect((settings.charts[0].data.values[0] as PlotSeries).values[0].y)
            .toBeNull()
    })

    it('Should disable tooltip and legend when not applicable', () => {
        const settings = normalize({
            type: ChartType.Gauge,
            data: { values: [{ value: 1 }] },
            enableTooltip: true,
            enableLegend: true,
            disableInteractions: true
        } as unknown as ChartSettings)

        expect([settings.enableTooltip, settings.enableLegend])
            .toEqual([false, false])
    })

    it('Should convert dates to the same ISO string for the same moment and keep milliseconds', () => {
        const settings = normalize({
            type: ChartType.Plot,
            data: {
                xType: PlotAxisType.Date,
                values: [
                    {
                        label: 'A',
                        values: [
                            { x: new Date('2024-01-02T03:04:05.000Z'), y: 1 },
                            { x: '2024-01-02T03:04:05.000Z', y: 2 },
                            { x: '2024-01-02T03:04:05.001Z', y: 3 }
                        ]
                    }
                ]
            }
        } as unknown as ChartSettings)

        expect((settings.charts[0].data.values[0] as PlotSeries).values.map(point => point.x))
            .toEqual(['2024-01-02T03:04:05.000Z', '2024-01-02T03:04:05.000Z', '2024-01-02T03:04:05.001Z'])
    })
})