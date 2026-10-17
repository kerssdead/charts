import Value from 'types/base/Value'
import PlotPoint from 'types/PlotPoint'
import { PlotType } from 'static/Enums'

export default class PlotSeries extends Value {
    values: PlotPoint[]

    type: PlotType

    width: number

    dash: string

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