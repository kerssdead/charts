import { createProcess } from '@/charts/ChartDefinitions'
import GaugeProcess from '@/render/gauge/GaugeProcess'
import PieProcess from '@/render/pie/PieProcess'
import PlotProcess from '@/render/plot/PlotProcess'
import TreeMapProcess from '@/render/tree/TreeMapProcess'
import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import Data from '@/types/interfaces/Data'
import { LIGHT_THEME } from '@/Theme'
import { createState } from './ViewStateTestData'

jest.mock('@/render/gauge/GaugeProcess')
jest.mock('@/render/pie/PieProcess')
jest.mock('@/render/plot/PlotProcess')
jest.mock('@/render/tree/TreeMapProcess')
jest.mock('@/render/segmentedBar/SegmentedBarProcess')
jest.mock('@/render/treeBar/TreeBarProcess')

const data = {} as Data
const pixel = { x: 5, y: 12.5 }
const settings = {} as ChartSettings
const state = createState()

describe('Checking process creation', () => {
    it.each([
        [ChartType.Plot, PlotProcess],
        [ChartType.Pie, PieProcess],
        [ChartType.TreeMap, TreeMapProcess],
        [ChartType.Gauge, GaugeProcess],
        [ChartType.SegmentedBar, SegmentedBarProcess],
        [ChartType.TreeBar, TreeBarProcess]
    ])('Should create matching process for chart type %s', (type, Process) => {
        const processSettings = { ...settings, theme: LIGHT_THEME }

        expect(createProcess({ type, data }, pixel, processSettings, state))
            .toBeInstanceOf(Process)
        expect(Process)
            .toHaveBeenLastCalledWith(data, pixel, processSettings, state)
    })

    it('Should return undefined for unknown chart type', () => {
        expect(createProcess({ type: -1 as unknown as ChartType, data }, pixel, {
            ...settings,
            theme: LIGHT_THEME
        }, state))
            .toBeUndefined()
    })
})