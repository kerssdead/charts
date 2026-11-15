import { QueueAction } from '@/builders/QueueItemsBuilder'
import Formatter from '@/helpers/Formatter'
import Units from '@/helpers/Units'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import Data from '@/types/interfaces/Data'
import Panel, { type PanelScroll } from '@/types/Panel'
import Value from '@/types/base/Value'
import ItemData from '@/types/ItemData'
import ValueAxis from '@/types/ValueAxis'
import { stringWidth } from '@/helpers/Text'
import ChartViewState from '@/types/ChartViewState'
import { ThemePalette } from '@/Theme'

const LINE_BREAK = /<br\s*\/?>/gi

export default abstract class ChartProcess<
    TData extends Data,
    TSettings extends ProcessSettings = ProcessSettings
> {
    protected readonly data: TData

    protected readonly units: Units

    protected readonly settings: TSettings

    protected readonly state: ChartViewState

    panel: Panel | null = null

    onChange: (() => void) | undefined

    constructor(data: TData, pixel: Point, settings: TSettings, state: ChartViewState) {
        this.data = data
        this.units = new Units(pixel)
        this.settings = settings
        this.state = state
    }

    protected get theme(): ThemePalette {
        return this.settings.theme
    }

    abstract getData(): QueueAction[]

    getFixedData(): QueueAction[] {
        return []
    }

    getScroll(): PanelScroll | null {
        return null
    }

    getValueAxis(): ValueAxis | null {
        return null
    }

    isEmpty() {
        return !this.data.values.some(value => !this.state.isDisabled(value) && value.value > 0)
    }

    protected formatValue(value: number | Date | string) {
        return Formatter.value(value, this.settings.valuePostfix, this.settings.decimals)
    }

    protected tooltip(...rows: (string | undefined)[]) {
        return rows.filter(row => row).join('\n')
    }

    protected valueTooltip(item: Value, label: string | undefined, value: string) {
        const data = item.data as ItemData | string | undefined
        const text = typeof data == 'string' ? data.replace(LINE_BREAK, '\n') : undefined

        return this.tooltip(label, text, value)
    }

    protected static getItemData(item: Value) {
        return typeof item.data == 'object' ? item.data : undefined
    }

    protected getFittingFontSize(text: string, availableWidth: number, maxFontSize: number) {
        return Math.min(maxFontSize, availableWidth / stringWidth(text, 1))
    }

    protected percent(ratio: number) {
        return `${ +(ratio * 100).toFixed(1) }%`
    }

    protected share(value: number, ratio: number) {
        return `${ this.formatValue(value) } (${ this.percent(ratio) })`
    }
}