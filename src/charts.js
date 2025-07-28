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

        this.#prepareSettings()

        this.#dynSettings = new DynSettings(this, this.#settings)

        this.#legend = new Legend(this, this.#settings.data)

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
            item.id = createGuid()
    }
}