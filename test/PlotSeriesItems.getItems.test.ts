import { buildItems, createPlot, createSeries } from './PlotTestData'
import PlotSeries from '@/types/PlotSeries'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemLine from '@/types/RenderItemLine'
import PlotSeriesItems from '@/render/plot/PlotSeriesItems'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const create = (all: PlotSeries[]) => {
    const plot = createPlot(all)

    return new PlotSeriesItems(all, plot.layout, plot.seriesGroups, plot.style.getValueTooltip)
}

const getKeys = (all: PlotSeries[]) => buildItems(create(all).getItems()).map(item => item.key)

describe('Getting plot series items', () => {
    it.each([PlotType.Bar, PlotType.Column, PlotType.StackingColumn])(
        'Should keep unique %s keys for points sharing x',
        type => {
            const values = [{ x: 'A', y: 1 }, { x: 'A', y: 2 }, { x: 'B', y: 3 }]

            expect(getKeys([createSeries(type, [], { values })]))
                .toEqual([`series-${ type }-rect-A-0`, `series-${ type }-rect-A-1`, `series-${ type }-rect-B-0`])
        }
    )

    it('Should draw every series type in series order', () => {
        expect(getKeys([
            createSeries(PlotType.Line, [1]),
            createSeries(PlotType.Column, [1]),
            createSeries(PlotType.StackingColumn, [1]),
            createSeries(PlotType.Bar, [1]),
            createSeries(PlotType.AttentionLine, [1])
        ]))
            .toEqual([
                'series-0-line-0',
                'series-2-rect-C0-0',
                'series-4-rect-C0-0',
                'series-3-rect-C0-0',
                'series-1-attention'
            ])
    })

    it('Should skip disabled lines and attention lines', () => {
        expect(getKeys([
            createSeries(PlotType.Line, [1], { disabled: true }),
            createSeries(PlotType.AttentionLine, [1], { disabled: true }),
            createSeries(PlotType.Column, [1])
        ]))
            .toEqual(['series-2-rect-C0-0'])
    })

    it('Should keep disabled columns, stacks and bars as ghosts', () => {
        const items = buildItems(create([
            createSeries(PlotType.Column, [1], { disabled: true }),
            createSeries(PlotType.StackingColumn, [1], { disabled: true }),
            createSeries(PlotType.Bar, [1], { disabled: true }),
            createSeries(PlotType.Line, [1])
        ]).getItems())

        expect(items.filter(item => item.isGhost).map(item => item.key))
            .toEqual(['series-2-rect-C0-0', 'series-4-rect-C0-0', 'series-3-rect-C0-0'])
    })

    it('Should restart stacks on every call', () => {
        const seriesItems = create([
            createSeries(PlotType.StackingColumn, [10]),
            createSeries(PlotType.StackingColumn, [20])
        ])
        const getTops = () => {
            return buildItems(seriesItems.getItems()).map(item => (item.shape as RenderItemRectangle).absolute.y)
        }

        expect(getTops())
            .toEqual(getTops())
    })

    it('Should draw area series as line with area', () => {
        const items = buildItems(create([createSeries(PlotType.Area, [1])]).getItems())

        expect([items.map(item => item.key), (items[0].shape as RenderItemLine).area.baseline])
            .toEqual([['series-5-line-0'], expect.any(Number)])
    })

    it('Should skip disabled areas', () => {
        expect(getKeys([
            createSeries(PlotType.Area, [1], { disabled: true }),
            createSeries(PlotType.Column, [1])
        ]))
            .toEqual(['series-2-rect-C0-0'])
    })
})