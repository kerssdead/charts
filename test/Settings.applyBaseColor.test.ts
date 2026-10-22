import { applyBaseColor } from '@/helpers/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'

const FALLBACK = '#808080'

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