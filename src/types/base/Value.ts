import ItemData from '@/types/ItemData'

class Value {
    id!: string

    color!: string

    label?: string

    disabled?: boolean

    hideInLegend?: boolean

    data?: ItemData

    value!: number

    labelIndex!: number

    constructor(fields: object = {}) {
        for (const [key, value] of Object.entries(fields))
            if (!this.isGetterOrMethod(key))
                (this as Record<string, unknown>)[key] = value
    }

    private isGetterOrMethod(key: string) {
        return key in this
    }

    get isBlank() {
        return false
    }

    canToggle() {
        return false
    }
}

export default Value