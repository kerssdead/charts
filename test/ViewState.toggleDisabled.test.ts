import ViewState from '@/charts/ViewState'
import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartOptions from '@/types/ChartOptions'

const create = (charts: object[]) => {
    const settings = normalize({ charts } as unknown as ChartOptions)
    const viewState = new ViewState()

    viewState.apply(settings)

    return { viewState, values: settings.charts.map(chart => chart.data.values[0]) }
}

describe('Toggling disabled value', () => {
    it('Should disable and enable value without changing it', () => {
        const { viewState, values: [value] } = create([{ type: ChartType.Pie, data: { values: [{ label: 'A', value: 1 }] } }])

        viewState.toggleDisabled(value)

        const isDisabledAfterFirstToggle = viewState.isDisabled(value)

        viewState.toggleDisabled(value)

        expect([isDisabledAfterFirstToggle, viewState.isDisabled(value), value.disabled])
            .toEqual([true, false, undefined])
    })

    it('Should toggle same label values of all charts together', () => {
        const chart = { type: ChartType.Pie, data: { values: [{ label: 'A', value: 1 }] } }
        const { viewState, values } = create([chart, chart])

        viewState.toggleDisabled(values[0])

        expect(values.map(value => viewState.isDisabled(value)))
            .toEqual([true, true])
    })
})