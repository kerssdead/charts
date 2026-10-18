import ItemData from '@/types/ItemData'

class Value {
    id: string

    color: string

    label: string

    disabled: boolean

    hideInLegend: boolean

    data: ItemData

    value: number

    checkCondition(): boolean {
        return false
    }

    reset() {
        this.disabled = false
    }
}

export default Value