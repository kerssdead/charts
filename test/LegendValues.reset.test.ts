import LegendValues from '@/legend/LegendValues'
import ViewState from '@/charts/ViewState'
import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'

describe('Resetting legend values', () => {
    it('Should enable values and stop toggle animations', () => {
        const settings = normalize({
            type: ChartType.Pie,
            data: { values: [{ label: 'A', value: 1 }, { label: 'B', value: 1, disabled: true }] }
        } as unknown as ChartSettings)
        const viewState = new ViewState()
        const legend = new LegendValues(settings, viewState)
        const [first, second] = settings.charts[0].data.values

        viewState.apply(settings)
        legend.toggle(first)
        legend.reset()

        expect([legend.isDisabled(first), legend.isDisabled(second), legend.isToggling])
            .toEqual([false, false, false])
    })
})