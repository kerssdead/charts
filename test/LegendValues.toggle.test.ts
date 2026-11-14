import LegendValues from '@/legend/LegendValues'
import ViewState from '@/charts/ViewState'
import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'

const create = (staticMode: boolean = false) => {
    const settings = normalize({
        type: ChartType.Pie,
        staticMode,
        data: { values: [{ label: 'A', value: 1 }, { label: 'B', value: 0 }] }
    } as unknown as ChartSettings)
    const viewState = new ViewState()

    viewState.apply(settings)

    return { legend: new LegendValues(settings, viewState), viewState, values: settings.charts[0].data.values }
}

describe('Toggling legend value', () => {
    it('Should disable value in view state and start toggle animation', () => {
        const { legend, viewState, values: [value] } = create()

        expect([legend.toggle(value), viewState.isDisabled(value), legend.isDisabled(value), legend.isToggling])
            .toEqual([true, true, true, true])
    })

    it('Should ignore value while its toggle is animating', () => {
        const { legend, viewState, values: [value] } = create()

        legend.toggle(value)

        expect([legend.toggle(value), viewState.isDisabled(value)])
            .toEqual([false, true])
    })

    it('Should ignore value that cannot be toggled', () => {
        const { legend, viewState, values: [, blank] } = create()

        expect([legend.toggle(blank), viewState.isDisabled(blank)])
            .toEqual([false, false])
    })

    it('Should not animate toggles in static mode', () => {
        const { legend, values: [value] } = create(true)

        legend.toggle(value)

        expect([legend.isToggling, legend.toggle(value), legend.isDisabled(value)])
            .toEqual([false, true, false])
    })
})