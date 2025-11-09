import Value from 'types/base/Value'
import PlotPoint from 'types/PlotPoint'
import { LineType, PlotType } from 'static/Enums'

class PlotSeries extends Value {
    values: PlotPoint[]

    type: PlotType

    width: number

    lineType: LineType = LineType.Solid

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

export default PlotSeries