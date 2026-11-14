import Value from '@/types/base/Value'
import ChartSettings from '@/types/ChartSettings'
import { groupBy } from '@/helpers/Collections'
import { AnimationTiming } from '@/static/constants/Index'
import { hasLegend } from '@/charts/ChartDefinitions'
import ViewState from '@/charts/ViewState'

export default class LegendValues {
    private settings: ChartSettings

    private values: Value[] = []

    private readonly viewState: ViewState

    private readonly toggles: Map<string, DOMHighResTimeStamp | null> = new Map()

    constructor(settings: ChartSettings, viewState: ViewState) {
        this.settings = settings
        this.viewState = viewState
        this.values = LegendValues.getValues(settings)
    }

    private static getValues(settings: ChartSettings): Value[] {
        return settings.charts.filter(hasLegend).flatMap(chart => chart.data.values)
    }

    get isToggling() {
        return this.toggles.size > 0
    }

    apply(settings: ChartSettings) {
        this.settings = settings
        this.values = LegendValues.getValues(settings)
    }

    getVisible(): Value[] {
        const groups = groupBy(this.values.filter(value => !value.hideInLegend), value => this.getKey(value))

        return Array.from(groups.values(), group => group[0])
    }

    getKey(value: Value) {
        return this.viewState.getKey(value)
    }

    isDisabled(value: Value) {
        return this.viewState.isDisabled(value)
    }

    toggle(value: Value): boolean {
        const key = this.getKey(value)

        if (this.toggles.has(key) || !value.canToggle())
            return false

        this.viewState.toggleDisabled(value)

        if (!this.settings.staticMode)
            this.toggles.set(key, null)

        return true
    }

    reset() {
        this.toggles.clear()
        this.viewState.reset()
    }

    updateToggles(now: DOMHighResTimeStamp) {
        for (const [key, start] of this.toggles) {
            if (start == null)
                this.toggles.set(key, now)
            else if (now - start >= AnimationTiming.legend)
                this.toggles.delete(key)
        }
    }

    clear() {
        this.toggles.clear()
    }
}