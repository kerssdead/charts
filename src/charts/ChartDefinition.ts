import ChartProcess, { ProcessContext } from '@/render/ChartProcess'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import Value from '@/types/base/Value'
import Data from '@/types/interfaces/Data'
import TableData from '@/types/TableData'
import ChartViewState, { IsDisabled } from '@/types/ChartViewState'
import { ThemePalette } from '@/Theme'

type ChartDefinition<TData extends Data> = {
    createProcess: (
        data: TData,
        pixel: Point,
        settings: ChartSettings & { theme: ThemePalette },
        context: ProcessContext
    ) => ChartProcess<TData>
    prepareData: (data: TData, numberLocale: string | undefined) => void
    normalizeData: (data: TData, numberLocale: string | undefined, scope?: Element) => void
    mergeSameLabelValues?: (data: TData) => void
    applyViewState?: (data: TData, state: ChartViewState) => void
    getValuesWithChildren?: (data: TData) => Value[]
    getPaletteValues: (data: TData) => Value[]
    getUngroupedPaletteValues?: (data: TData) => Value[]
    applyOwnColors?: (data: TData, baseColor: string) => void
    getTableRows: (data: TData, isDisabled: IsDisabled) => TableData
    summarizeTable?: (table: TableData) => TableData
    hasLegend: (data: TData) => boolean
    hasMenu: boolean
    hasFixedHeader: boolean
}

export default ChartDefinition