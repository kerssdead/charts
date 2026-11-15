import { buildItems, createPlot, createSeries } from './PlotTestData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotSeries from '@/types/PlotSeries'
import RenderItemLine from '@/types/RenderItemLine'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'
import { LIGHT_THEME } from '@/Theme'
import { DARK_THEME } from './TestTheme'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const styleBreakMark = (all: PlotSeries[], series: PlotSeries, slot: number, valueIndex: number) => {
    const { style } = createPlot(all, {}, LIGHT_THEME)

    return buildItems((items: QueueItemsBuilder) => {
        return style.styleBreakMark(items.line(), series, slot, valueIndex)
    })[0]
}

describe('Styling plot break mark', () => {
    it('Should key mark by series id and point x', () => {
        const series = createSeries(PlotType.Column, [1, 2], { id: 'sales' })

        expect(styleBreakMark([createSeries(PlotType.Line, [1]), series], series, 1, 1).key)
            .toBe('sales-break-C1-0')
    })

    it('Should draw background colored mark above lines', () => {
        const series = createSeries(PlotType.Column, [1])
        const item = styleBreakMark([series], series, 0, 0)

        expect([(item.shape as RenderItemLine).width, item.stroke, item.layer, item.isInteractive])
            .toEqual([3, '#ffffff', Layer.Data + 3, false])
    })

    it('Should use the theme canvas colour for the mark', () => {
        const series = createSeries(PlotType.Column, [1])
        const { style } = createPlot([series], {}, DARK_THEME)
        const item = buildItems((items: QueueItemsBuilder) => {
            return style.styleBreakMark(items.line(), series, 0, 0)
        })[0]

        expect(item.stroke)
            .toBe(DARK_THEME.canvasBackground)
    })

    it('Should fade mark in after its column grows', () => {
        const series = createSeries(PlotType.Column, [1, 2])
        const { animation } = styleBreakMark([series], series, 1, 1)

        expect([animation.initDuration, animation.initDelay, animation.initFade])
            .toEqual([
                AnimationTiming.plotBreakInit,
                AnimationTiming.plotInit + AnimationTiming.plotInitStagger,
                true
            ])
    })
})