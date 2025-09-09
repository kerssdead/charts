class Value {
    id: string

    color: string

    label: string

    disabled: boolean

    hideInLegend: boolean

    data: { [key: string]: string }

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