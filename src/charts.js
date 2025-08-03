class OChart {
    /**
     * @type {HTMLElement}
     */
    node

    /**
     * @type {OData}
     */
    data

    /**
     * @type {OChartSettings}
     */
    #settings

    /**
     * @type {ODynSettings}
     */
    #dynSettings

    /**
     * @type {OLegend}
     */
    #legend

    /**
     * @param {HTMLElement} context
     * @param {OChartSettings} settings
     */
    constructor(context, settings) {
        context[OChartProperties.chart] = this

        this.node = context
        this.data = settings.data
        this.#settings = settings

        this.#prepareSettings()

        this.#dynSettings = new ODynSettings(this, this.#settings)

        this.#legend = new OLegend(this)

        if (this.#legend) {
            this.#dynSettings.renderer.canvas.height -= 200

            this.#legend.canvas.width = this.#dynSettings.renderer.canvas.width > this.#dynSettings.renderer.canvas.height
                ? this.#dynSettings.renderer.canvas.height
                : this.#dynSettings.renderer.canvas.width
        }
    }

    render() {
        this.#dynSettings.renderer.render()
        this.#legend.render()
    }

    destroy() {

    }

    #prepareSettings() {
        for (let item of this.#settings.data.values)
            item.id = OHelper.guid()
    }
}