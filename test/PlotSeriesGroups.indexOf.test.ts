import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotSeries from '@/types/PlotSeries'
import { isDisabledByFlag } from './ViewStateTestData'

const groups = (series: PlotSeries[]) => new PlotSeriesGroups(series, isDisabledByFlag)

describe('Getting plot series index', () => {
    it('Should return position in all series including disabled ones', () => {
        const disabled = { disabled: true, values: [] } as unknown as PlotSeries
        const enabled = { values: [] } as unknown as PlotSeries

        expect(groups([disabled, enabled]).indexOf(enabled))
            .toBe(1)
    })

    it('Should return minus one for unknown series', () => {
        expect(groups([]).indexOf({} as PlotSeries))
            .toBe(-1)
    })
})