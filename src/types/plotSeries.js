class OPlotSeries extends OBasePoint {
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
     * @param passed {int}
     * @param duration {int}
     */
    toggle(passed, duration) {
        super.toggle(passed, duration)
    }

    /**
     * @return {boolean}
     */
    checkCondition() {
        super.checkCondition()

        return true
    }
}