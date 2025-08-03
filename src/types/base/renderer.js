class ORenderer {
    /**
     * @type {HTMLElement}
     */
    node

    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {OChartSettings}
     */
    settings

    /**
     * @type {ODynSettings}
     */
    dynSettings

    /**
     * @type {OChart}
     */
    chart

    /**
     * @type {OAnimations}
     */
    animations

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        this.node = chart.node
        this.settings = settings
        this.dynSettings = dynSettings
        this.chart = chart
        this.animations = new OAnimations()

        this.canvas = document.createElement('canvas')

        this.canvas.width = 1600
        this.canvas.height = 1000

        this.node.append(this.canvas)
    }

    render() {

    }

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
    }
}