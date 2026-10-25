import { buildItems, createPlot, createSeries } from './PlotTestData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotSeries from '@/types/PlotSeries'
import RenderItemLine from '@/types/RenderItemLine'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const styleLine = (all: PlotSeries[], series: PlotSeries, suffix: string) => {
    const { style } = createPlot(all)

    return buildItems((items: QueueItemsBuilder) => style.styleLine(items.line(), series, suffix))[0]
}

describe('Styling plot line', () => {
    it('Should key line by series index and suffix', () => {
        const series = createSeries(PlotType.Line, [1])

        expect(styleLine([createSeries(PlotType.Column, [1]), series], series, 'line').key)
            .toBe('1-line')
    })

    it('Should draw interactive line above data with series width and color', () => {
        const series = createSeries(PlotType.Line, [1], { width: 4 })
        const item = styleLine([series], series, 'line')

        expect((item.shape as RenderItemLine).width)
            .toBe(4)
        expect(item.color)
            .toBe(series.color)
        expect(item.layer)
            .toBe(Layer.Data + 1)
        expect(item.isInteractive)
            .toBe(true)
        expect(item.animation.initDuration)
            .toBe(AnimationTiming.plotLineInit)
    })

    it('Should group hover only with several enabled series', () => {
        const series = createSeries(PlotType.Line, [1])

        expect(styleLine([series, createSeries(PlotType.Line, [1])], series, 'line').hoverGroup)
            .toBe('0')
        expect(styleLine([series], series, 'line').hoverGroup)
            .toBeNull()
    })
})