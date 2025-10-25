import { Value } from 'types/base/Value'
import { Point } from 'types/Point'
import { DrawPoint } from 'types/DrawPoint'
import { AnimationType } from '../static/Enums'
import { LineStyles } from './LineStyles'

export class Sector extends Value {
    canRenderLabel: boolean

    isMouseInside: boolean

    current: number

    transition: number

    innerRadius: number

    /**
     * Angle in radians
     */
    direction: number

    lineStyles: LineStyles | undefined

    translate: Point

    state: AnimationType

    points: DrawPoint[]

    labelPoints: DrawPoint[]

    constructor(obj: object) {
        super()

        Object.assign(this, obj)

        this.baseColor = this.color
        this.canRenderLabel = false
        this.isMouseInside = false
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