import ChartProcess from '@/render/ChartProcess'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import Value from '@/types/base/Value'
import Data from '@/types/interfaces/Data'
import TableData from '@/types/TableData'

type ChartDefinition<TData extends Data> = {
    createProcess: (data: TData, pixel: Point, settings: ChartSettings) => ChartProcess<TData>

    prepareData: (data: TData, numberLocale: string | undefined) => void

    normalizeData: (data: TData, numberLocale: string | undefined, scope?: Element) => void

    mergeSameLabelValues?: (data: TData) => void

    keepState?: (previous: TData, next: TData) => void

    getPaletteValues: (data: TData) => Value[]

    getUngroupedPaletteValues?: (data: TData) => Value[]

    applyOwnColors?: (data: TData, baseColor: string) => void

    getTableRows: (data: TData) => TableData

    summarizeTable?: (table: TableData) => TableData

    hasLegend: (data: TData) => boolean

    hasMenu: boolean

    hasFixedHeader: boolean
}

export default ChartDefinition