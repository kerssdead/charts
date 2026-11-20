import { createSeries } from './PlotTestData'
import Units from '@/helpers/Units'
import { getCapRoom } from '@/render/plot/PlotCapMarks'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 2, y: 3 })

describe('Getting cap room', () => {
    it('Should reserve nothing without y max', () => {
        expect(getCapRoom(UNITS, [createSeries(PlotType.Column, [400])], undefined, false))
            .toEqual({ top: 0, right: 0 })
    })

    it('Should reserve room above capped columns for caret and value', () => {
        expect(getCapRoom(UNITS, [createSeries(PlotType.Column, [10, 400])], 100, false))
            .toEqual({ top: 60, right: 0 })
    })

    it('Should reserve room above stacks whose total exceeds y max', () => {
        const series = [createSeries(PlotType.StackingColumn, [60]), createSeries(PlotType.StackingColumn, [60])]

        expect(getCapRoom(UNITS, series, 100, false).top)
            .toBe(60)
    })

    it('Should reserve nothing when every column fits', () => {
        expect(getCapRoom(UNITS, [createSeries(PlotType.Column, [10, 100])], 100, false))
            .toEqual({ top: 0, right: 0 })
    })

    it('Should reserve room right of capped bars for the widest value', () => {
        expect(getCapRoom(UNITS, [createSeries(PlotType.Bar, [400, 12000])], 100, true))
            .toEqual({ top: 0, right: 2 * (9 + 3 * 5.5) })
    })

    it('Should ignore capped bars in mixed plots', () => {
        expect(getCapRoom(UNITS, [createSeries(PlotType.Bar, [400])], 100, false).right)
            .toBe(0)
    })
})
