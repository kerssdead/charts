import Value from '@/types/base/Value'
import ChartItem from '@/types/ChartItem'
import ChartSettings from '@/types/ChartSettings'
import { groupBy } from '@/helpers/Collections'
import { AnimationTiming } from '@/static/constants/Index'
import { ChartType } from '@/static/Enums'

export default class LegendValues {
    private settings: ChartSettings

    private values: Value[] = []

    private readonly toggles: Map<string, DOMHighResTimeStamp | null> = new Map()

    constructor(settings: ChartSettings) {
        this.settings = settings
        this.values = LegendValues.getValues(settings)
    }

    static isSupported(chart: ChartItem) {
        return chart.type !== ChartType.Gauge
               && chart.type !== ChartType.SegmentedBar
               && chart.type !== ChartType.TreeBar
               && (chart.type !== ChartType.TreeMap || (chart.data?.values?.length ?? 0) > 1)
    }

    static getGroupKey(value: Value, isShared: boolean) {
        return isShared ? `${ value.label }-${ value.labelIndex }` : value.id
    }

    private static getValues(settings: ChartSettings): Value[] {
        return settings.charts.filter(LegendValues.isSupported).flatMap(chart => chart.data.values)
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
        return LegendValues.getGroupKey(value, this.settings.charts.length > 1)
    }

    toggle(value: Value): boolean {
        const key = this.getKey(value)

        if (this.toggles.has(key) || !value.canToggle())
            return false

        const disabled = value.disabled

        for (const item of this.values)
            if (this.getKey(item) === key && item.disabled === disabled)
                item.disabled = !disabled

        if (!this.settings.staticMode)
            this.toggles.set(key, null)

        return true
    }

    reset() {
        this.toggles.clear()

        for (const value of this.values)
            value.reset()
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