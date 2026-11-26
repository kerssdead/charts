import { QueueAction } from '@/builders/QueueItemsBuilder'
import Formatter from '@/helpers/Formatter'
import { formatPercent } from '@/helpers/Percent'
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

export type ProcessContext = {
    state: ChartViewState
    panel?: Panel
    onChange?: () => void
}

type RingSizing = {
    radius: number
    innerRadiusRatio: number
}

export default abstract class ChartProcess<
    TData extends Data,
    TSettings extends ProcessSettings = ProcessSettings
> {
    protected readonly units: Units

    protected readonly state: ChartViewState

    protected readonly panel: Panel | null

    protected readonly onChange?: () => void

    constructor(
        protected readonly data: TData,
        pixel: Point,
        protected readonly settings: TSettings,
        { state, panel, onChange }: ProcessContext
    ) {
        this.units = new Units(pixel)
        this.state = state
        this.panel = panel ?? null
        this.onChange = onChange
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

    protected getFittingFontSizeInRing(text: string, ring: RingSizing, widthRatio: number, maxFontSize: number) {
        const innerDiameter = ring.radius * ring.innerRadiusRatio * 2

        return this.getFittingFontSize(text, innerDiameter * widthRatio, maxFontSize)
    }

    protected percent(ratio: number) {
        return formatPercent(ratio)
    }

    protected share(value: number, ratio: number) {
        return `${ this.formatValue(value) } (${ this.percent(ratio) })`
    }
}