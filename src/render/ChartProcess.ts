import { QueueAction } from '@/builders/QueueItemsBuilder'
import Formatter from '@/helpers/Formatter'
import Units from '@/helpers/Units'
import Point from '@/types/Point'

export default abstract class ChartProcess<TData> {
    protected readonly data: TData

    protected readonly units: Units

    protected readonly valuePostfix: string | undefined

    protected constructor(data: TData, pixel: Point, valuePostfix: string | undefined) {
        this.data = data
        this.units = new Units(pixel)
        this.valuePostfix = valuePostfix
    }

    abstract getData(): QueueAction[]

    protected formatValue(value: number | Date | string) {
        return Formatter.value(value, this.valuePostfix)
    }

    protected tooltip(...rows: (string | undefined)[]) {
        return rows.filter(row => row).join('\n')
    }

    protected percent(ratio: number) {
        return `${ +(ratio * 100).toFixed(1) }%`
    }
}