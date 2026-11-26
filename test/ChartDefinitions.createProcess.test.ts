import { createProcess } from '@/charts/ChartDefinitions'
import GaugeProcess from '@/render/gauge/GaugeProcess'
import PieProcess from '@/render/pie/PieProcess'
import PlotProcess from '@/render/plot/PlotProcess'
import TreeMapProcess from '@/render/tree/TreeMapProcess'
import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import HeatMapProcess from '@/render/heatMap/HeatMapProcess'
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
jest.mock('@/render/heatMap/HeatMapProcess')

const data = {} as Data
const pixel = { x: 5, y: 12.5 }
const settings = {} as ChartSettings
const context = { state: createState() }

describe('Checking process creation', () => {
    it.each([
        [ChartType.Plot, PlotProcess],
        [ChartType.Pie, PieProcess],
        [ChartType.TreeMap, TreeMapProcess],
        [ChartType.Gauge, GaugeProcess],
        [ChartType.SegmentedBar, SegmentedBarProcess],
        [ChartType.TreeBar, TreeBarProcess],
        [ChartType.HeatMap, HeatMapProcess]
    ])('Should create matching process for chart type %s', (type, Process) => {
        const processSettings = { ...settings, theme: LIGHT_THEME }

        expect(createProcess({ type, data }, pixel, processSettings, context))
            .toBeInstanceOf(Process)
        expect(Process)
            .toHaveBeenLastCalledWith(data, pixel, processSettings, context)
    })

    it('Should create an empty process for unknown chart type', () => {
        const process = createProcess(
            { type: -1 as unknown as ChartType, data },
            pixel,
            { ...settings, theme: LIGHT_THEME },
            context
        )

        expect([process.getData(), process.isEmpty()])
            .toEqual([[], false])
    })
})