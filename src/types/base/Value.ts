import ItemData from 'types/ItemData'

class Value {
    id: string

    isColorGenerated?: boolean

    color: string

    label: string

    disabled: boolean

    hideInLegend: boolean

    data: ItemData

    value: number

    toggle(transition: number) {
        if (transition == 0)
            this.disabled = !this.disabled
    }

    checkCondition(): boolean {
        return false
    }

    reset() {
        this.disabled = false
    }
}

export default Value