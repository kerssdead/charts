import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

const series = (type: PlotType, disabled = false) => ({ type, disabled, values: [] }) as unknown as PlotSeries

describe('Creating plot series groups', () => {
    it('Should keep only enabled series', () => {
        const enabled = series(PlotType.Line)

        expect(new PlotSeriesGroups([enabled, series(PlotType.Line, true)]).enabledSeries)
            .toEqual([enabled])
    })

    it('Should collect bars including disabled ones', () => {
        const bar = series(PlotType.Bar)
        const disabledBar = series(PlotType.Bar, true)

        expect(new PlotSeriesGroups([bar, series(PlotType.Line), disabledBar]).barSeries)
            .toEqual([bar, disabledBar])
    })

    it('Should collect vertical series without bars and attention lines', () => {
        const column = series(PlotType.Column)
        const stack = series(PlotType.StackingColumn)
        const line = series(PlotType.Line)
        const groups = new PlotSeriesGroups([column, series(PlotType.Bar), stack, series(PlotType.AttentionLine), line])

        expect(groups.verticalSeries)
            .toEqual([column, stack, line])
    })

    it('Should be horizontal when all series are bars', () => {
        expect(new PlotSeriesGroups([series(PlotType.Bar), series(PlotType.Bar, true)]).isHorizontal)
            .toBe(true)
    })

    it('Should not be horizontal with other series or without series', () => {
        expect(new PlotSeriesGroups([series(PlotType.Bar), series(PlotType.Line)]).isHorizontal)
            .toBe(false)
        expect(new PlotSeriesGroups([]).isHorizontal)
            .toBe(false)
    })
})