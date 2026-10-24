import { QueueAction } from '@/builders/QueueItemsBuilder'
import Formatter from '@/helpers/Formatter'
import Units from '@/helpers/Units'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import Data from '@/types/interfaces/Data'
import type { PanelScroll } from '@/types/Panel'
import Value from '@/types/base/Value'
import ItemData from '@/types/ItemData'
import CustomTooltip from '@/renderer/CustomTooltip'

const LINE_BREAK = /<br\s*\/?>/gi

export default abstract class ChartProcess<
    TData extends Data,
    TSettings extends ProcessSettings = ProcessSettings
> {
    protected readonly data: TData

    protected readonly units: Units

    protected readonly settings: TSettings

    onChange: (() => void) | undefined

    constructor(data: TData, pixel: Point, settings: TSettings) {
        this.data = data
        this.units = new Units(pixel)
        this.settings = settings
    }

    abstract getData(): QueueAction[]

    getFixedData(): QueueAction[] {
        return []
    }

    getScroll(): PanelScroll | null {
        return null
    }

    isEmpty() {
        return !this.data.values.some(value => !value.disabled && value.value > 0)
    }

    protected formatValue(value: number | Date | string) {
        return Formatter.value(value, this.settings.valuePostfix)
    }

    protected tooltip(...rows: (string | undefined)[]) {
        return rows.filter(row => row).join('\n')
    }

    protected valueTooltip(item: Value, label: string | undefined, value: string) {
        const data = item.data as ItemData | string | undefined
        const text = typeof data == 'string' ? data.replace(LINE_BREAK, '\n') : undefined

        return CustomTooltip.fromText(this.tooltip(label, text, value))
    }

    protected static getItemData(item: Value) {
        return typeof item.data == 'object' ? item.data : undefined
    }

    protected percent(ratio: number) {
        return `${ +(ratio * 100).toFixed(1) }%`
    }

    protected share(value: number, ratio: number) {
        return `${ this.formatValue(value) } (${ this.percent(ratio) })`
    }
}