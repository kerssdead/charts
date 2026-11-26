import Value from '@/types/base/Value'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'
import ToggleSet from '@/types/ToggleSet'
import SortState from '@/types/SortState'

export type IsDisabled = (value: Value) => boolean

export default class ChartViewState {
    readonly pinned = new ToggleSet<Sector>()

    readonly expanded = new ToggleSet<TreeBarRow>()

    readonly sort = new SortState()

    constructor(readonly isDisabled: IsDisabled) {
    }
}