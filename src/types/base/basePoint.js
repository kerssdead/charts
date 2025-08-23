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
     * @type {boolean}
     */
    hideInLegend

    /**
     * @type {object}
     */
    data

    /**
     * @param transition {number}
     */
    toggle(transition) {
        if (transition === 0)
            this.disabled = !this.disabled
    }

    /**
     * @return {boolean}
     */
    checkCondition() { }

    reset() {
        this.disabled = false
    }
}