import Value from 'types/base/Value'
import PlotPoint from 'types/PlotPoint'
import { LineType, PlotAxisType, PlotType } from 'static/Enums'
import * as Helper from '../Helper'

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

    // TODO: better name ?
    inverse() {
        this.values = this.values.map(v => new PlotPoint(v))

        for (const value of this.values)
            value.inverse()

        this.values.sort((a, b) => b.x > a.x ? 1 : -1)
    }

    // TODO: better name ?
    normalize(xType: PlotAxisType) {
        this.disabled = !this.values
        this.type ??= PlotType.Line

        for (let value of this.values) {
            value.id = Helper.guid()

            if (xType == PlotAxisType.Date) {
                if (Helper.isISOString(value.x as string))
                    value.x = new Date(value.x)
                else
                    console.warn(`${ value.x } is not a date in ISO format.`)
            }
        }
    }
}

export default PlotSeries