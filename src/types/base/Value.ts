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

    constructor(fields: object = {}) {
        for (const [key, value] of Object.entries(fields))
            if (!this.isGetterOrMethod(key))
                (this as Record<string, unknown>)[key] = value
    }

    private isGetterOrMethod(key: string): boolean {
        return key in this
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