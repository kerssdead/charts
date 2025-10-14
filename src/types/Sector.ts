import { Value } from 'types/base/Value'
import { Point } from 'types/Point'

export class Sector extends Value {
    current: number

    transition: number

    translate: Point

    innerRadius: number

    constructor(obj: object) {
        super()

        Object.assign(this, obj)
    }

    toggle(transition: number) {
        super.toggle(transition)

        if (this.disabled)
            this.current = this.value * (1 - transition)
        else
            this.current = this.value * transition
    }

    checkCondition(): boolean {
        super.checkCondition()

        return (this.current == 0 && !this.disabled) || this.value != 0
    }

    reset() {
        super.reset()

        this.current = this.value
    }
}