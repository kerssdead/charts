import ChartSettings from '@/types/ChartSettings'
import Value from '@/types/base/Value'
import ChartViewState from '@/types/ChartViewState'
import { ChartType } from '@/static/Enums'
import { getGroupKey } from '@/helpers/ValueKeys'
import { mergeKeyFlags, toggleKey } from '@/helpers/KeySets'
import { getChartDefinition, getValuesWithChildren } from '@/charts/ChartDefinitions'

type ChartEntry = {
    type: ChartType
    state: ChartViewState
}

export default class ViewState {
    private disabled = new Set<string>()

    private charts: ChartEntry[] = []

    private isShared = false

    apply(settings: ChartSettings) {
        this.isShared = settings.charts.length > 1

        const values = settings.charts.flatMap(getValuesWithChildren)

        this.disabled = mergeKeyFlags(values.map(value => [this.getKey(value), value.disabled]), this.disabled)

        this.charts = settings.charts.map((chart, index) => {
            const previous = this.charts[index]
            const state = previous?.type === chart.type
                          ? previous.state
                          : new ChartViewState(value => this.isDisabled(value))

            if (chart.data)
                getChartDefinition(chart.type).applyViewState?.(chart.data, state)

            return { type: chart.type, state }
        })
    }

    getKey(value: Value) {
        return getGroupKey(value, this.isShared)
    }

    isDisabled(value: Value) {
        return this.disabled.has(this.getKey(value))
    }

    toggleDisabled(value: Value) {
        toggleKey(this.disabled, this.getKey(value))
    }

    getChartState(index: number) {
        return this.charts[index].state
    }

    reset() {
        this.disabled.clear()

        for (const { state } of this.charts)
            state.pinned.clear()
    }
}