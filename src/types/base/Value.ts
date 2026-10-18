import ItemData from '@/types/ItemData'

class Value {
    id: string

    color: string

    label: string

    disabled: boolean

    hideInLegend: boolean

    data: ItemData

    value: number

    constructor(obj: object = {}) {
        Object.assign(this, obj)
    }

    checkCondition(): boolean {
        return false
    }

    reset() {
        this.disabled = false
    }
}

export default Value