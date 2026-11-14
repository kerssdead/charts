import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'
import { isDisabledByFlag } from './ViewStateTestData'

const series = (type: PlotType, disabled = false, values: { x: string, y: number }[] = []) => {
    return { type, disabled, values } as unknown as PlotSeries
}

const point = [{ x: 'A', y: 1 }]

const groups = (series: PlotSeries[]) => new PlotSeriesGroups(series, isDisabledByFlag)

describe('Creating plot series groups', () => {
    it('Should keep only enabled series', () => {
        const enabled = series(PlotType.Line)

        expect(groups([enabled, series(PlotType.Line, true)]).enabledSeries)
            .toEqual([enabled])
    })

    it('Should collect bars including disabled ones', () => {
        const bar = series(PlotType.Bar)
        const disabledBar = series(PlotType.Bar, true)

        expect(groups([bar, series(PlotType.Line), disabledBar]).barSeries)
            .toEqual([bar, disabledBar])
    })

    it('Should collect vertical series without bars and attention lines', () => {
        const column = series(PlotType.Column)
        const stack = series(PlotType.StackingColumn)
        const line = series(PlotType.Line)
        const seriesGroups = groups([
            column,
            series(PlotType.Bar),
            stack,
            series(PlotType.AttentionLine),
            line
        ])

        expect(seriesGroups.verticalSeries)
            .toEqual([column, stack, line])
    })

    it('Should be horizontal when all series are bars', () => {
        expect(groups([series(PlotType.Bar), series(PlotType.Bar, true)]).isHorizontal)
            .toBe(true)
    })

    it('Should not be horizontal with other series or without series', () => {
        expect(groups([series(PlotType.Bar), series(PlotType.Line)]).isHorizontal)
            .toBe(false)
        expect(groups([]).isHorizontal)
            .toBe(false)
    })

    it('Should be horizontal when only bars have values to show', () => {
        const bar = series(PlotType.Bar, false, point)

        expect(groups([bar, series(PlotType.Line, true, point)]).isHorizontal)
            .toBe(true)
        expect(groups([bar, series(PlotType.Line, false, [])]).isHorizontal)
            .toBe(true)
    })

    it('Should not be horizontal when bars are hidden and other series are shown', () => {
        expect(groups([
            series(PlotType.Bar, true, point),
            series(PlotType.Line, false, point)
        ]).isHorizontal)
            .toBe(false)
    })

    it('Should stay mixed when nothing has values to show', () => {
        expect(groups([
            series(PlotType.Bar, true, point),
            series(PlotType.Line, true, point)
        ]).isHorizontal)
            .toBe(false)
    })

    it('Should count only bars as bar only series regardless of disabled state', () => {
        const bar = series(PlotType.Bar, false, point)

        expect(groups([bar, series(PlotType.Bar, true, point)]).hasOnlyBarSeries)
            .toBe(true)
        expect(groups([bar, series(PlotType.Line, true, point)]).hasOnlyBarSeries)
            .toBe(false)
        expect(groups([]).hasOnlyBarSeries)
            .toBe(false)
    })
})