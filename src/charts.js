class Chart {
    /**
     * @type {HTMLElement}
     */
    node

    /**
     * @type {ChartSettings}
     */
    #settings

    /**
     * @type {DynSettings}
     */
    #dynSettings

    /**
     * @param {HTMLElement} context
     * @param {ChartSettings} settings
     */
    constructor(context, settings) {
        context[ChartProperties.chart] = this

        this.node = context
        this.#settings = settings
        this.#dynSettings = new DynSettings(this, settings)
    }

    render() {
        this.#dynSettings.renderer.render()
    }

    destroy() {

    }
}