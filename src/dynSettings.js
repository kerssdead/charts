class ODynSettings {
    /**
     * @type {ORenderer}
     */
    renderer

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     */
    constructor(chart, settings) {
        switch (settings.type) {
            case OChartTypes.plot:
                this.renderer = new OPlotRenderer(chart, settings, this)
                break

            case OChartTypes.circular:
                this.renderer = new OCircularRenderer(chart, settings, this)
                break
        }
    }
}