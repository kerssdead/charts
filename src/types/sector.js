class OSector extends OBasePoint {
    /**
     * @type {number}
     */
    value

    /**
     * @type {number}
     */
    current

    /**
     * @type {OPoint}
     */
    transition

    /**
     * @type {number}
     */
    innerRadius

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

        if (this.disabled)
            this.current = this.value * (1 - passed / duration)
        else
            this.current = this.value * passed / duration
    }

    /**
     * @return {boolean}
     */
    checkCondition() {
        super.checkCondition()

        return (this.current === 0 && !this.disabled) || this.value !== 0
    }

    reset() {
        super.reset()

        this.current = this.value
    }
}