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

    state.applyPinned(values as Sector[])
    state.applyExpanded(getAllTreeBarRows(values as TreeBarRow[]))
    state.applySort(data.sortColumn, data.sortDescending)

    return state
}