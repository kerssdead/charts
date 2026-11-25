import Value from '@/types/base/Value'
import ItemData from '@/types/ItemData'

type HeatMapCellFields = {
    id?: string
    color?: string
    label?: string
    disabled?: boolean
    data?: ItemData
    value?: number
    x?: string | number
    y?: string | number
}

export default class HeatMapCell extends Value {
    x!: string | number

    y!: string | number

    constructor(fields: HeatMapCellFields = {}) {
        super()

        this.id = fields.id as string
        this.color = fields.color as string
        this.label = fields.label
        this.disabled = fields.disabled
        this.data = fields.data
        this.value = fields.value as number
        this.x = fields.x as string | number
        this.y = fields.y as string | number
    }
}