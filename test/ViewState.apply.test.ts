import ViewState from '@/charts/ViewState'
import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import TreeBarData from '@/types/data/TreeBarData'
import Sector from '@/types/Sector'

const pie = (values: object[]) => normalize({ type: ChartType.Pie, data: { values } } as unknown as ChartSettings)

const treeBar = (data: object) => normalize({ type: ChartType.TreeBar, data } as unknown as ChartSettings)

const rows = (settings: ChartSettings) => (settings.charts[0].data as TreeBarData).values

const isDisabled = (viewState: ViewState, settings: ChartSettings) => {
    return settings.charts[0].data.values.map(value => viewState.isDisabled(value))
}

describe('Applying view state', () => {
    it('Should disable values marked in data without changing them', () => {
        const viewState = new ViewState()
        const settings = pie([{ label: 'A', value: 1, disabled: true }, { label: 'B', value: 1 }])

        viewState.apply(settings)

        expect([isDisabled(viewState, settings), settings.charts[0].data.values[1].disabled])
            .toEqual([[true, false], undefined])
    })

    it('Should keep disabled values between settings', () => {
        const viewState = new ViewState()

        viewState.apply(pie([{ label: 'A', value: 1, disabled: true }]))

        const next = pie([{ label: 'A', value: 1 }])

        viewState.apply(next)

        expect(isDisabled(viewState, next))
            .toEqual([true])
    })

    it('Should respect explicit enabled value', () => {
        const viewState = new ViewState()

        viewState.apply(pie([{ label: 'A', value: 1, disabled: true }]))

        const next = pie([{ label: 'A', value: 1, disabled: false }])

        viewState.apply(next)

        expect(isDisabled(viewState, next))
            .toEqual([false])
    })

    it('Should forget disabled values that left the data', () => {
        const viewState = new ViewState()

        viewState.apply(pie([{ label: 'A', value: 1, disabled: true }]))
        viewState.apply(pie([{ label: 'B', value: 1 }]))

        const next = pie([{ label: 'A', value: 1 }])

        viewState.apply(next)

        expect(isDisabled(viewState, next))
            .toEqual([false])
    })

    it('Should share disabled state between charts by label', () => {
        const viewState = new ViewState()
        const settings = normalize({
            charts: [
                { type: ChartType.Pie, data: { values: [{ label: 'A', value: 1, disabled: true }] } },
                { type: ChartType.Pie, data: { values: [{ label: 'A', value: 2 }] } }
            ]
        } as unknown as ChartSettings)

        viewState.apply(settings)

        expect(viewState.isDisabled(settings.charts[1].data.values[0]))
            .toBe(true)
    })

    it('Should disable nested tree bar rows marked in data', () => {
        const viewState = new ViewState()
        const settings = treeBar({ values: [{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B', disabled: true }] }] })

        viewState.apply(settings)

        expect(rows(settings)[0].children?.map(row => viewState.isDisabled(row)))
            .toEqual([true])
    })

    it('Should keep chart state for chart of same type', () => {
        const viewState = new ViewState()

        viewState.apply(treeBar({ values: [{ id: 'a', label: 'A', expanded: true }], sortColumn: 'amount' }))

        const previous = viewState.getChartState(0)

        const next = treeBar({ values: [{ id: 'a', label: 'A' }] })

        viewState.apply(next)

        const state = viewState.getChartState(0)

        expect([state === previous, state.isExpanded(rows(next)[0]), state.sortColumn])
            .toEqual([true, true, 'amount'])
    })

    it('Should create new chart state when chart type changes', () => {
        const viewState = new ViewState()

        viewState.apply(treeBar({ values: [{ id: 'a', label: 'A', expanded: true }] }))

        const previous = viewState.getChartState(0)

        viewState.apply(pie([{ id: 'a', label: 'A', value: 1 }]))

        expect(viewState.getChartState(0) === previous)
            .toBe(false)
    })

    it('Should pin sectors marked in pie data', () => {
        const viewState = new ViewState()
        const settings = pie([{ id: 'a', label: 'A', value: 1, pinned: true }])

        viewState.apply(settings)

        expect(viewState.getChartState(0).isPinned(settings.charts[0].data.values[0] as Sector))
            .toBe(true)
    })
})