import { OBasePoint } from '/src/types/base/basePoint.js'

export class OPlotSeries extends OBasePoint {
    /**
     * @type {OPlotPoint[]}
     */
    values

    /**
     * @type {int}
     */
    type

    /**
     * @type {int}
     */
    width

    /**
     * @param obj {object}
     */
    constructor(obj) {
        super()

        Object.assign(this, obj)
    }

    /**
     * @param transition {number}
     */
    toggle(transition) {
        super.toggle(transition)
    }

    /**
     * @return {boolean}
     */
    checkCondition() {
        super.checkCondition()

        return true
    }

    reset() {
        super.reset()
    }
}