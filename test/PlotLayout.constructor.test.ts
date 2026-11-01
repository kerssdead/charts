import { createPlot, createSeries } from './PlotTestData'
import { getRoundedValues } from '@/helpers/Numbers'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const BAND_GAP = 12 * 1.3 + 24

describe('Creating plot layout', () => {
    it('Should use simple margin for simple chart', () => {
        expect(createPlot([createSeries(PlotType.Line, [1, 2])], { simple: true }).layout.margin)
            .toEqual({ top: 50, right: 50, bottom: 50, left: 50 })
    })

    it('Should give whole height to vertical section without bars', () => {
        const { layout } = createPlot([createSeries(PlotType.Column, [1, 2])])

        expect(layout.vertical.band)
            .toEqual({ top: layout.margin.top, bottom: 5000 - layout.margin.bottom })
    })

    it('Should give whole height to horizontal section with only bars', () => {
        const { layout } = createPlot([createSeries(PlotType.Bar, [1, 2])])

        expect(layout.horizontal.band)
            .toEqual({ top: layout.margin.top, bottom: 5000 - layout.margin.bottom })
    })

    it('Should put bars above vertical section in mixed chart', () => {
        const { layout } = createPlot([createSeries(PlotType.Bar, [1, 2]), createSeries(PlotType.Line, [1, 2])])
        const { horizontal, vertical } = layout
        const total = vertical.band.bottom - horizontal.band.top - BAND_GAP

        expect(horizontal.band.top)
            .toBe(layout.margin.top)
        expect(vertical.band.top - horizontal.band.bottom)
            .toBeCloseTo(BAND_GAP)
        expect((horizontal.band.bottom - horizontal.band.top) / total)
            .toBeCloseTo(0.35)
    })

    it('Should give whole height to bars when vertical series are disabled', () => {
        const { layout } = createPlot([
            createSeries(PlotType.Bar, [1, 2]),
            createSeries(PlotType.Line, [1, 2], { disabled: true })
        ])

        expect(layout.horizontal.band)
            .toEqual({ top: layout.margin.top, bottom: 5000 - layout.margin.bottom })
    })

    it('Should give whole height to vertical section when bars are disabled', () => {
        const { layout } = createPlot([
            createSeries(PlotType.Bar, [1, 2], { disabled: true }),
            createSeries(PlotType.Line, [1, 2])
        ])

        expect(layout.vertical.band)
            .toEqual({ top: layout.margin.top, bottom: 5000 - layout.margin.bottom })
    })

    it('Should narrow left margin when disabled bars take their categories away', () => {
        const line = createSeries(PlotType.Line, [1, 2])
        const values = [{ x: 'a very long bar category label', y: 1 }]

        const getLeft = (disabled: boolean) => {
            return createPlot([createSeries(PlotType.Bar, [], { values, disabled }), line]).layout.margin.left
        }

        expect(getLeft(true))
            .toBeLessThan(getLeft(false))
    })

    it('Should not limit bar axis by y max when only vertical series are disabled', () => {
        const { layout } = createPlot(
            [createSeries(PlotType.Bar, [300]), createSeries(PlotType.Line, [1], { disabled: true })],
            { yMax: 100 }
        )

        expect(layout.horizontal.valueScale.values)
            .toEqual(getRoundedValues([300], 5))
    })

    it('Should take vertical categories from vertical series and horizontal ones from bars', () => {
        const bar = createSeries(PlotType.Bar, [1], { values: [{ x: 'bar', y: 1 }] })
        const line = createSeries(PlotType.Line, [1], { values: [{ x: 'line', y: 1 }] })
        const { layout } = createPlot([bar, line])

        expect(layout.vertical.categoryScale.slots.values)
            .toEqual(['line'])
        expect(layout.horizontal.categoryScale.slots.values)
            .toEqual(['bar'])
    })

    it('Should round section values', () => {
        const { layout } = createPlot([createSeries(PlotType.Bar, [8, 90]), createSeries(PlotType.Line, [3, 40])])

        expect(layout.vertical.valueScale.values)
            .toEqual(getRoundedValues([3, 40], 5))
        expect(layout.horizontal.valueScale.values)
            .toEqual(getRoundedValues([8, 90], 5))
    })

    it('Should ignore zero y max', () => {
        expect(createPlot([], { yMax: 0 }).layout.yMax)
            .toBeUndefined()
        expect(createPlot([], { yMax: 100 }).layout.yMax)
            .toBe(100)
    })
})