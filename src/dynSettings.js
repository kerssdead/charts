import { OChartTypes } from '/src/enums.js'
import { OPlotRenderer } from '/src/render/plotRenderer.js'
import { OCircularRenderer } from '/src/render/circularRenderer.js'
import { OGaugeRenderer } from '/src/render/gaugeRenderer.js'
import { OTreeRenderer } from '/src/render/treeRenderer.js'

export class ODynSettings {
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

            case OChartTypes.gauge:
                this.renderer = new OGaugeRenderer(chart, settings, this)
                break

            case OChartTypes.treemap:
                this.renderer = new OTreeRenderer(chart, settings, this)
                break
        }
    }
}