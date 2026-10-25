import ProcessFactory from '@/render/ProcessFactory'
import GaugeProcess from '@/render/gauge/GaugeProcess'
import PieProcess from '@/render/pie/PieProcess'
import PlotProcess from '@/render/plot/PlotProcess'
import TreeMapProcess from '@/render/tree/TreeMapProcess'
import SegmentedBarProcess from '@/render/segmentedBar/SegmentedBarProcess'
import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import Data from '@/types/interfaces/Data'

jest.mock('@/render/gauge/GaugeProcess')
jest.mock('@/render/pie/PieProcess')
jest.mock('@/render/plot/PlotProcess')
jest.mock('@/render/tree/TreeMapProcess')
jest.mock('@/render/segmentedBar/SegmentedBarProcess')
jest.mock('@/render/treeBar/TreeBarProcess')

const data = {} as Data
const pixel = { x: 5, y: 12.5 }
const settings = {} as ChartSettings

describe('Checking process creation', () => {
    it.each([
        [ChartType.Plot, PlotProcess],
        [ChartType.Pie, PieProcess],
        [ChartType.TreeMap, TreeMapProcess],
        [ChartType.Gauge, GaugeProcess],
        [ChartType.SegmentedBar, SegmentedBarProcess],
        [ChartType.TreeBar, TreeBarProcess]
    ])('Should create matching process for chart type %s', (type, Process) => {
        expect(ProcessFactory.create({ type, data }, pixel, settings))
            .toBeInstanceOf(Process)
        expect(Process)
            .toHaveBeenLastCalledWith(data, pixel, settings)
    })

    it('Should return undefined for unknown chart type', () => {
        expect(ProcessFactory.create({ type: -1 as ChartType, data }, pixel, settings))
            .toBeUndefined()
    })
})