import { normalizeSeries } from '@/helpers/ValueNormalization'
import PlotData from '@/types/data/PlotData'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType, PlotScaleType } from '@/static/Enums'
import TextResources from '@/static/TextResources'

const normalize = (points: object[], xType?: PlotAxisType, numberLocale?: string) => {
    const data = { xType, values: [new PlotSeries({ label: 'A', value: '5', values: points })] } as PlotData

    normalizeSeries(data, numberLocale)

    return data.values[0]
}

describe('Normalizing plot series', () => {
    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('Should normalize series values', () => {
        expect(normalize([]).value)
            .toBe(5)
    })

    it('Should parse y with number locale and replace invalid y with null', () => {
        expect(normalize([{ x: 1, y: '2.000' }, { x: 2, y: 'N/A' }, { x: 3 }], undefined, 'de-DE').values.map(point => point.y))
            .toEqual([2000, null, null])
    })

    it('Should drop points without x', () => {
        expect(normalize([{ x: null, y: 1 }, { y: 2 }, { x: 0, y: 3 }]).values.map(point => point.x))
            .toEqual([0])
    })

    it('Should label points with empty x', () => {
        expect(normalize([{ x: '', y: 1 }]).values[0].x)
            .toBe(TextResources.noLabel)
    })

    it('Should convert dates to ISO strings for date axis', () => {
        const points = [{ x: new Date('2024-01-02T03:04:05.000Z'), y: 1 }, { x: 'not a date', y: 2 }]

        expect(normalize(points, PlotAxisType.Date).values.map(point => point.x))
            .toEqual(['2024-01-02T03:04:05.000Z', 'not a date'])
    })

    it('Should keep x of other axis types', () => {
        expect(normalize([{ x: '2024-01-02', y: 1 }]).values[0].x)
            .toBe('2024-01-02')
    })

    it('Should accept series without points', () => {
        expect(normalize(undefined as unknown as object[]).values)
            .toBeUndefined()
    })

    it('Should accept data without series', () => {
        expect(() => normalizeSeries({ xType: PlotAxisType.Date } as PlotData, undefined))
            .not.toThrow()
    })

    it('Should accept series without points', () => {
        const data = { xType: PlotAxisType.Date, values: [new PlotSeries({ label: 'A' })] } as PlotData

        normalizeSeries(data, undefined)

        expect(data.values[0].values)
            .toBeUndefined()
    })

    it('Should convert legacy numeric axis type and scales', () => {
        const data = { xType: 1, xScale: 2, yScale: 1, values: [] } as unknown as PlotData

        normalizeSeries(data, undefined)

        expect([data.xType, data.xScale, data.yScale])
            .toEqual([PlotAxisType.Date, PlotScaleType.Log, PlotScaleType.Linear])
    })
})