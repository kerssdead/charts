import { getAxisValues } from '@/render/plot/PlotAxisValues'
import { getRoundedValues } from '@/helpers/Numbers'
import PlotSeries from '@/types/PlotSeries'
import { getLogAxisValues } from '@/helpers/AxisTicks'
import { PlotScaleType, PlotType } from '@/static/Enums'

const series = (type: PlotType, ...ys: (number | null)[]) => {
    return { type, values: ys.map((y, i) => ({ x: i, y })) } as PlotSeries
}

describe('Getting plot axis values', () => {
    it('Should round column and line values for y axis', () => {
        expect(getAxisValues([series(PlotType.Column, 3, 17), series(PlotType.Line, 40)], undefined, false))
            .toEqual({ yAxisValues: getRoundedValues([3, 17, 40], 5), xAxisValues: [] })
    })

    it('Should round bar values for x axis', () => {
        expect(getAxisValues([series(PlotType.Bar, 8, 90)], undefined, true))
            .toEqual({ yAxisValues: [], xAxisValues: getRoundedValues([8, 90], 5) })
    })

    it('Should sum stacking columns per x and sign', () => {
        const stacks = [series(PlotType.StackingColumn, 30, -10), series(PlotType.StackingColumn, 50, -15)]

        expect(getAxisValues(stacks, undefined, false).yAxisValues)
            .toEqual(getRoundedValues([80, -25], 5))
    })

    it('Should limit y axis by y max', () => {
        expect(getAxisValues([series(PlotType.Column, 300)], 100, false).yAxisValues)
            .toEqual(getRoundedValues([300], 5, 100))
    })

    it('Should limit x axis by y max only when all series are bars', () => {
        expect(getAxisValues([series(PlotType.Bar, 300)], 100, true).xAxisValues)
            .toEqual(getRoundedValues([300], 5, 100))
        expect(getAxisValues([series(PlotType.Bar, 300)], 100, false).xAxisValues)
            .toEqual(getRoundedValues([300], 5))
    })

    it('Should use log values on log scale', () => {
        const all = [series(PlotType.Column, 3, 700), series(PlotType.Bar, 20)]

        expect(getAxisValues(all, undefined, false, PlotScaleType.Log))
            .toEqual({ yAxisValues: getLogAxisValues([3, 700]), xAxisValues: getLogAxisValues([20]) })
    })

    it('Should limit log axis by y max', () => {
        expect(getAxisValues([series(PlotType.Column, 700)], 500, false, PlotScaleType.Log).yAxisValues)
            .toEqual(getLogAxisValues([700], 500))
    })

    it('Should ignore missing values', () => {
        const all = [
            series(PlotType.Column, 30, null),
            series(PlotType.StackingColumn, 50, null),
            series(PlotType.Bar, null, 20)
        ]

        expect(getAxisValues(all, undefined, false))
            .toEqual({ yAxisValues: getRoundedValues([50, 30], 5), xAxisValues: getRoundedValues([20], 5) })
    })

    it('Should give no axis values when every value is missing', () => {
        expect(getAxisValues([series(PlotType.Line, null, null)], undefined, false))
            .toEqual({ yAxisValues: [], xAxisValues: [] })
    })
})