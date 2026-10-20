import ItemData from '@/types/ItemData'

class Value {
    id: string

    color: string

    label: string

    disabled: boolean

    hideInLegend: boolean

    data: ItemData

    value: number

    labelIndex: number

    constructor(obj: object = {}) {
        Object.assign(this, obj)
    }

    get isBlank(): boolean {
        return false
    }

    canToggle(): boolean {
        return false
    }

    reset() {
        this.disabled = false
    }
}

export default Value