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
    settings

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
        this.settings = settings

        this.#prepareSettings()

        this.#dynSettings = new ODynSettings(this, this.settings)

        if  (this.settings.enableLegend) {
            this.#legend = new OLegend(this)

            this.#dynSettings.renderer.canvas.height -= 200

            this.#legend.canvas.width = this.#dynSettings.renderer.canvas.width > this.#dynSettings.renderer.canvas.height
                ? this.#dynSettings.renderer.canvas.height
                : this.#dynSettings.renderer.canvas.width
        }
    }

    render() {
        this.#dynSettings.renderer.render()
        this.#legend?.render()
    }

    destroy() {

    }

    #prepareSettings() {
        const baseColor = getRandomColor()
        const adjustStep = Math.round(100 / this.settings.data.values.length)
        let adjustAmount = -50

        for (let item of this.settings.data.values) {
            item.id = OHelper.guid()
            item.color ??= OHelper.adjustColor(baseColor, adjustAmount += adjustStep)
        }
    }
}