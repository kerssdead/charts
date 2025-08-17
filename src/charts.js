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
        this.node.style.display = 'flex'
        this.node.style.flexDirection = 'column'
        this.node.style.alignItems = 'center'

        this.data = settings.data
        this.settings = settings

        this.#prepareSettings()

        this.#dynSettings = new ODynSettings(this, this.settings)

        if (this.settings.enableLegend)
            this.#legend = new OLegend(this, context)
    }

    render() {
        this.#dynSettings.renderer.render()
        this.#legend?.render()

        this.#refresh()
    }

    destroy() {

    }

    #prepareSettings() {
        const baseColor = this.settings.baseColor ?? OHelper.randomColor()
        let adjustStep = Math.round(100 / this.settings.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        for (let item of this.settings.data.values) {
            item.id = OHelper.guid()
            item.color ??= OHelper.adjustColor(baseColor, adjustAmount += adjustStep)
            item.disabled = !item.value
            item.value ??= 0

            if (this.settings.type === OChartTypes.plot)
                for (let it of item.values) {
                    it.id = OHelper.guid()
                    it.value ??= 0
                }
        }

        if (this.settings.data.values.filter(v => v.value < 0)) {
            for (const item of this.settings.data.values.filter(v => v.value < 0))
                console.warn(`"${item.name}" has negative value (${item.value}) and will not be render`)

            this.settings.data.values = this.settings.data.values.filter(v => v.value >= 0)
        }

        const dimension = this.node.parentNode.getBoundingClientRect()

        if (!this.settings.width || +this.settings.width === 0)
            this.settings.width = dimension.width
        if (!this.settings.height || +this.settings.height === 0)
            this.settings.height = dimension.height

        this.settings.legendPlace ??= OLegendPlaces.bottom
    }

    #refresh() {
        this.#dynSettings.renderer.refresh()
        this.#legend?.refresh()
    }
}