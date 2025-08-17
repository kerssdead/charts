class OBasePoint {
    /**
     * @type {string}
     */
    id

    /**
     * @type {string}
     */
    color

    /**
     * @type {string}
     */
    label

    /**
     * @type {boolean}
     */
    disabled

    /**
     * @type {object}
     */
    data

    /**
     * @param passed {int}
     * @param duration {int}
     */
    toggle(passed, duration) {
        if (passed === 0)
            this.disabled = !this.disabled
    }

    /**
     * @return {boolean}
     */
    checkCondition() { }
}