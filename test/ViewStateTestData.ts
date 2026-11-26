import ChartViewState, { IsDisabled } from '@/types/ChartViewState'
import Data from '@/types/interfaces/Data'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'
import { getAllTreeBarRows } from '@/types/data/TreeBarData'

type StateData = Partial<Data> & {
    sortColumn?: string
    sortDescending?: boolean
}

export const isDisabledByFlag: IsDisabled = value => !!value.disabled

export function createState(data: StateData = {}) {
    const state = new ChartViewState(isDisabledByFlag)
    const values = data.values ?? []

    state.pinned.apply(values as Sector[], sector => sector.pinned)
    state.expanded.apply(getAllTreeBarRows(values as TreeBarRow[]), row => row.expanded)
    state.sort.apply(data.sortColumn, data.sortDescending)

    return state
}