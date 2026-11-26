import { getChartDefinition } from '@/charts/ChartDefinitions'
import ChartViewState from '@/types/ChartViewState'
import Data from '@/types/interfaces/Data'
import { ChartType } from '@/static/Enums'

const emptyData = {} as Data

const ALL_TYPES = [
    ChartType.Plot,
    ChartType.Pie,
    ChartType.Gauge,
    ChartType.TreeMap,
    ChartType.SegmentedBar,
    ChartType.TreeBar,
    ChartType.HeatMap
]

describe('Getting palette values from chart definitions', () => {
    it('Should return no values for data without values', () => {
        for (const type of ALL_TYPES)
            expect(getChartDefinition(type)?.getPaletteValues(emptyData))
                .toEqual([])
    })

    it('Should return no ungrouped values for segmented bar without stops', () => {
        expect(getChartDefinition(ChartType.SegmentedBar)?.getUngroupedPaletteValues?.(emptyData))
            .toEqual([])
    })

    it('Should return stops as ungrouped values for segmented bar', () => {
        const stops = [{ value: 1 }]

        const data = { stops } as unknown as Data

        expect(getChartDefinition(ChartType.SegmentedBar)?.getUngroupedPaletteValues?.(data))
            .toBe(stops)
    })

    it('Should pin nothing for pie data without values', () => {
        const state = { pinned: { apply: jest.fn() } } as unknown as ChartViewState

        getChartDefinition(ChartType.Pie).applyViewState?.(emptyData, state)

        expect(state.pinned.apply)
            .toHaveBeenCalledWith([], expect.any(Function))
    })
})