import ProcessFactory from '@/render/ProcessFactory'
import { ChartType } from '@/static/Enums'

describe('Checking fixed header chart types', () => {
    it('Should have fixed header for tree bar', () => {
        expect(ProcessFactory.hasFixedHeader(ChartType.TreeBar))
            .toBe(true)
    })

    it.each([
        ChartType.Plot,
        ChartType.Pie,
        ChartType.TreeMap,
        ChartType.Gauge,
        ChartType.SegmentedBar
    ])('Should not have fixed header for chart type %s', type => {
        expect(ProcessFactory.hasFixedHeader(type))
            .toBe(false)
    })
})