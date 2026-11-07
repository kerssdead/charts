import { applyDefaultColors } from '@/helpers/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import TreeBarData from '@/types/data/TreeBarData'
import Palette from '@/static/constants/Palette'

describe('Applying default colors', () => {
    const create = (charts: object[], baseColor?: string) => ({ charts, baseColor }) as unknown as ChartSettings

    it('Should keep defined colors', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A', color: '#ff0000' }] } }])

        applyDefaultColors(settings)

        expect(settings.charts[0].data.values[0].color)
            .toBe('#ff0000')
    })

    it('Should use base color for single uncolored value', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }] } }], '#336699')

        applyDefaultColors(settings)

        expect(settings.charts[0].data.values[0].color)
            .toBe('#336699')
    })

    it('Should spread shades around base color', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] } }], '#808080')

        applyDefaultColors(settings)

        expect(settings.charts[0].data.values.map(value => value.color))
            .toEqual(['#3d3d3d', '#808080', '#c3c3c3'])
    })

    it('Should use palette colors in order without base color', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] } }])

        applyDefaultColors(settings)

        expect(settings.charts[0].data.values.map(value => value.color))
            .toEqual(Palette.slice(0, 3))
    })

    it('Should skip palette colors only for colored values', () => {
        const settings = create([{ type: ChartType.Pie, data: { values: [{ label: 'A', color: '#ff0000' }, { label: 'B' }] } }])

        applyDefaultColors(settings)

        expect(settings.charts[0].data.values.map(value => value.color))
            .toEqual(['#ff0000', Palette[0]])
    })

    it('Should color segmented bar stops after values from palette', () => {
        const settings = create([{
            type: ChartType.SegmentedBar,
            data: { values: [{ label: 'A', value: 1 }], stops: [{ label: 'Stop', value: 1 }] }
        }])

        applyDefaultColors(settings)

        const data = settings.charts[0].data as unknown as { values: { color: string }[], stops: { color: string }[] }

        expect([data.values[0].color, data.stops[0].color])
            .toEqual([Palette[0], Palette[1]])
    })

    it('Should color tree bar rows with first palette color without base color', () => {
        const settings = create([{ type: ChartType.TreeBar, data: { values: [{ label: 'A' }, { label: 'B' }] } }])

        applyDefaultColors(settings)

        expect((settings.charts[0].data as TreeBarData).values.map(row => row.color))
            .toEqual([Palette[0], Palette[0]])
    })

    it('Should give same colors to same data in separate settings', () => {
        const first = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }] } }])
        const second = create([{ type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }] } }])

        applyDefaultColors(first)
        applyDefaultColors(second)

        expect(second.charts[0].data.values.map(value => value.color))
            .toEqual(first.charts[0].data.values.map(value => value.color))
    })

    it('Should share colors by label between charts', () => {
        const settings = create([
            { type: ChartType.Pie, data: { values: [{ label: 'A', color: '#ff0000' }, { label: 'B' }] } },
            { type: ChartType.Pie, data: { values: [{ label: 'A' }, { label: 'B' }] } }
        ])

        applyDefaultColors(settings)

        const [first, second] = settings.charts.map(chart => chart.data.values.map(value => value.color))

        expect(second)
            .toEqual(first)
        expect(first[0])
            .toBe('#ff0000')
    })
})