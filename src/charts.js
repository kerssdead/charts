class Chart {
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

        this.#settings = settings
        this.#dynSettings = new DynSettings(this, settings)
    }

    async render() {
        this.#dynSettings.renderer.render()
    }

    async destroy() {

    }
}