import { buildItems, createPlot, createSeries } from './PlotTestData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotSeries from '@/types/PlotSeries'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const styleRect = (all: PlotSeries[], series: PlotSeries, slot: number, valueIndex: number = slot) => {
    const { style } = createPlot(all)

    return buildItems((items: QueueItemsBuilder) => {
        return style.styleRect(items.rect(), series, series.values[valueIndex], slot, valueIndex)
    })[0]
}

describe('Styling plot rectangle', () => {
    it('Should key rectangle by series id and point x', () => {
        const series = createSeries(PlotType.Column, [1, 2, 3], { id: 'sales' })

        expect(styleRect([createSeries(PlotType.Line, [1]), series], series, 0, 2).key)
            .toBe('sales-rect-C2-0')
    })

    it('Should keep key when series is inserted before', () => {
        const series = createSeries(PlotType.Column, [1], { id: 'sales' })

        expect(styleRect([createSeries(PlotType.Column, [1], { id: 'costs' }), series], series, 0).key)
            .toBe(styleRect([series], series, 0).key)
    })

    it('Should keep key when point is inserted before', () => {
        const series = createSeries(PlotType.Column, [], { id: 'sales', values: [{ x: 'B', y: 2 }] })
        const inserted = { ...series, values: [{ x: 'A', y: 1 }, ...series.values] } as PlotSeries

        expect(styleRect([inserted], inserted, 1).key)
            .toBe(styleRect([series], series, 0).key)
    })

    it('Should make interactive data rectangle with value tooltip', () => {
        const series = createSeries(PlotType.Column, [5], { data: undefined })
        const item = styleRect([series], series, 0)

        expect(item.isInteractive)
            .toBe(true)
        expect(item.tooltipTemplate)
            .toBe(`${ series.label }: 5`)
        expect(item.layer)
            .toBe(Layer.Data)
        expect(item.color)
            .toBe(series.color)
        expect(item.hasContextMenu)
            .toBe(true)
    })

    it('Should stagger init animation by slot', () => {
        const series = createSeries(PlotType.Column, [1, 2, 3, 4])
        const item = styleRect([series], series, 2)

        expect(item.animation.initDuration)
            .toBe(AnimationTiming.plotInit)
        expect(item.animation.initDelay)
            .toBe(2 * AnimationTiming.plotInitStagger)
    })

    it('Should stagger values sharing a slot equally', () => {
        const series = createSeries(PlotType.Column, [1, 2, 3, 4])

        expect(styleRect([series], series, 1, 3).animation.initDelay)
            .toBe(styleRect([series], series, 1, 1).animation.initDelay)
    })

    it('Should spread stagger over many slots', () => {
        const series = createSeries(PlotType.Column, Array(100).fill(1))

        expect(styleRect([series], series, 10).animation.initDelay)
            .toBe(10 * AnimationTiming.plotInitStaggerTotal / 100)
    })

    it('Should group hover only with several enabled series', () => {
        const series = createSeries(PlotType.Column, [1], { id: 'sales' })
        const other = createSeries(PlotType.Column, [1], { id: 'costs' })

        expect(styleRect([series, other], series, 0).hoverGroup)
            .toBe('sales')
        expect(styleRect([series, { ...other, disabled: true } as PlotSeries], series, 0).hoverGroup)
            .toBeNull()
    })

    it('Should ghost disabled series', () => {
        const series = createSeries(PlotType.Column, [1], { disabled: true })
        const item = styleRect([series], series, 0)

        expect(item.isGhost)
            .toBe(true)
        expect(item.tooltipTemplate)
            .toBe('')
    })
})