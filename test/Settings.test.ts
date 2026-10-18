import { applyBaseColor, keepDisabled, normalize } from '@/helpers/Settings'
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

describe('Keeping disabled values', () => {
    const create = (disabled?: boolean) => normalize({
        type: ChartType.Pie,
        data: { values: [{ label: 'A', value: 1, disabled }, { label: 'B', value: 1 }] }
    } as unknown as ChartSettings, FALLBACK)

    it('Should keep value disabled between settings', () => {
        const next = create()

        keepDisabled(create(true), next)

        expect(next.charts[0].data.values.map(value => !!value.disabled))
            .toEqual([true, false])
    })

    it('Should respect explicit disabled value', () => {
        const next = create(false)

        keepDisabled(create(true), next)

        expect(next.charts[0].data.values[0].disabled)
            .toBe(false)
    })
})

describe('Applying base color', () => {
    const create = (charts: object[], baseColor?: string) => ({ charts, baseColor }) as unknown as ChartSettings

    it('Should keep defined colors', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A', color: '#ff0000' }] } }])

        applyBaseColor(settings, FALLBACK)

        expect(settings.charts[0].data.values[0].color)
            .toBe('#ff0000')
    })

    it('Should use base color for single uncolored value', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }] } }], '#336699')

        applyBaseColor(settings, FALLBACK)

        expect(settings.charts[0].data.values[0].color)
            .toBe('#336699')
    })

    it('Should spread shades around fallback color', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] } }])

        applyBaseColor(settings, FALLBACK)

        expect(settings.charts[0].data.values.map(value => value.color))
            .toEqual(['#3d3d3d', '#808080', '#c3c3c3'])
    })

    it('Should share colors by label between charts', () => {
        const settings = create([
            { type: ChartType.Pie, data: { values: [{ label: 'A', color: '#ff0000' }, { label: 'B' }] } },
            { type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }] } }
        ])

        applyBaseColor(settings, FALLBACK)

        const [first, second] = settings.charts.map(chart => chart.data.values.map(value => value.color))

        expect(second)
            .toEqual(first)
        expect(first[0])
            .toBe('#ff0000')
    })
})