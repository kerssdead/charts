class DynSettings {
    /**
     * @type {Renderer}
     */
    renderer

    /**
     * @param {Chart} chart
     * @param {ChartSettings} settings
     */
    constructor(chart, settings) {
        switch (settings.type) {
            case ChartTypes.plot:
                this.renderer = new PlotRenderer(chart, settings, this)
                break

            case ChartTypes.circular:
                this.renderer = new CircularRenderer(chart, settings, this)
                break
        }
    }
}