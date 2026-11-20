import ViewState from '@/charts/ViewState'
import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartOptions from '@/types/ChartOptions'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'

describe('Resetting view state', () => {
    it('Should enable all values and unpin all sectors', () => {
        const settings = normalize({
            type: ChartType.Pie,
            data: { values: [{ id: 'a', label: 'A', value: 1, disabled: true }, { id: 'b', label: 'B', value: 1, pinned: true }] }
        } as unknown as ChartOptions)
        const viewState = new ViewState()
        const [first, second] = settings.charts[0].data.values as Sector[]

        viewState.apply(settings)
        viewState.reset()

        expect([viewState.isDisabled(first), viewState.getChartState(0).isPinned(second)])
            .toEqual([false, false])
    })

    it('Should keep expanded rows and sort', () => {
        const settings = normalize({
            type: ChartType.TreeBar,
            data: { values: [{ id: 'a', label: 'A', expanded: true }], sortColumn: 'amount' }
        } as unknown as ChartOptions)
        const viewState = new ViewState()

        viewState.apply(settings)
        viewState.reset()

        const state = viewState.getChartState(0)

        expect([state.isExpanded(settings.charts[0].data.values[0] as TreeBarRow), state.sortColumn])
            .toEqual([true, 'amount'])
    })
})