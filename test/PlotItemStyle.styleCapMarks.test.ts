import { buildItems, createPlot, createSeries } from './PlotTestData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import PlotSeries from '@/types/PlotSeries'
import RenderItemLine from '@/types/RenderItemLine'
import { addColumnCapMarks } from '@/render/plot/PlotCapMarks'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'
import { ItemFlag as f } from '@/static/ItemFlag'
import { LIGHT_THEME, ThemePalette } from '@/Theme'
import { DARK_THEME } from './TestTheme'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const CAP = { span: { start: 0, end: 100 }, edge: 500, value: 400 }

const styleCapMarks = (
    series: PlotSeries,
    slot: number,
    valueIndex: number,
    theme: ThemePalette = LIGHT_THEME
) => {
    const { style, layout } = createPlot([series], {}, theme)

    return buildItems((items: QueueItemsBuilder) => {
        const marks = addColumnCapMarks(items, layout.units, CAP)

        style.styleCapMarks(marks, series, slot, valueIndex)
    })
}

describe('Styling plot cap marks', () => {
    it('Should key marks by series id and point x', () => {
        const series = createSeries(PlotType.Column, [1, 2], { id: 'sales' })

        expect(styleCapMarks(series, 1, 1).map(item => item.key))
            .toEqual(['sales-cap-fade-C1-0', 'sales-cap-caret-C1-0', 'sales-cap-value-C1-0'])
    })

    it('Should fade into the theme canvas colour', () => {
        const series = createSeries(PlotType.Column, [1])
        const [fade] = styleCapMarks(series, 0, 0, DARK_THEME)

        expect(fade.fill)
            .toBe(DARK_THEME.canvasBackground)
    })

    it('Should draw the caret in the series colour', () => {
        const series = createSeries(PlotType.Column, [1], { color: '#00ff00' })
        const caret = styleCapMarks(series, 0, 0)[1]

        expect([caret.color, (caret.shape as RenderItemLine).width])
            .toEqual(['#00ff00', 2])
    })

    it('Should keep marks above columns and lines without interaction', () => {
        const items = styleCapMarks(createSeries(PlotType.Column, [1]), 0, 0)

        expect(items.map(item => [item.layer, item.is(f.Interactive)]))
            .toEqual(Array(3).fill([Layer.Data + 3, false]))
    })

    it('Should fade marks in after their column grows', () => {
        const items = styleCapMarks(createSeries(PlotType.Column, [1, 2]), 1, 1)

        for (const { animation } of items)
            expect([animation.initDuration, animation.initDelay, animation.initFade])
                .toEqual([
                    AnimationTiming.plotCapInit,
                    AnimationTiming.plotInit + AnimationTiming.plotInitStagger,
                    true
                ])
    })
})
