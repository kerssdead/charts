import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'
import { isDisabledByFlag } from './ViewStateTestData'

const series = (type: PlotType, disabled = false, values = [{ x: 'A', y: 1 }]) => {
    return { type, disabled, values } as unknown as PlotSeries
}

const groups = (series: PlotSeries[]) => new PlotSeriesGroups(series, isDisabledByFlag)

describe('Checking rendered plot bars', () => {
    it('Should render bars with enabled bar series', () => {
        expect(groups([series(PlotType.Line), series(PlotType.Bar)]).rendersBars)
            .toBe(true)
    })

    it('Should not render bars without bar series', () => {
        expect(groups([series(PlotType.Line)]).rendersBars)
            .toBe(false)
    })

    it('Should not render bars when all of them are disabled', () => {
        expect(groups([series(PlotType.Line), series(PlotType.Bar, true)]).rendersBars)
            .toBe(false)
    })

    it('Should not render bars without values', () => {
        expect(groups([series(PlotType.Line), series(PlotType.Bar, false, [])]).rendersBars)
            .toBe(false)
    })

    it('Should keep bars when no series has values to show', () => {
        expect(groups([series(PlotType.Line, true), series(PlotType.Bar, true)]).rendersBars)
            .toBe(true)
    })
})