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
                this.renderer = new PlotRenderer()
                break

            case ChartTypes.circular:
                this.renderer = new CircularRenderer()
                break
        }
    }
}