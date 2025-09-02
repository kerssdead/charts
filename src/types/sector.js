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
     * @param transition {number}
     */
    toggle(transition) {
        super.toggle(transition)

        if (this.disabled)
            this.current = this.value * (1 - transition)
        else
            this.current = this.value * transition
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