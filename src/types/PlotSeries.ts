///<reference path="base/Value.ts"/>
class PlotSeries extends Value {
    values: PlotPoint[]

    type: number

    width: number

    constructor(obj: object) {
        super()

        Object.assign(this, obj)
    }

    toggle(transition: number) {
        super.toggle(transition)
    }

    checkCondition(): boolean {
        super.checkCondition()

        return true
    }

    reset() {
        super.reset()
    }
}