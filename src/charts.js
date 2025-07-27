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
     * @type {Legend}
     */
    #legend

    /**
     * @param {HTMLElement} context
     * @param {ChartSettings} settings
     */
    constructor(context, settings) {
        context[ChartProperties.chart] = this

        this.node = context
        this.#settings = settings
        this.#dynSettings = new DynSettings(this, settings)

        this.#legend = new Legend(this, settings.data)

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
}