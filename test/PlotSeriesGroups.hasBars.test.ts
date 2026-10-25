import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

const series = (type: PlotType) => ({ type, values: [] }) as unknown as PlotSeries

describe('Checking plot bars', () => {
    it('Should have bars with bar series', () => {
        expect(new PlotSeriesGroups([series(PlotType.Line), series(PlotType.Bar)]).hasBars)
            .toBe(true)
    })

    it('Should not have bars without bar series', () => {
        expect(new PlotSeriesGroups([series(PlotType.Line)]).hasBars)
            .toBe(false)
    })
})