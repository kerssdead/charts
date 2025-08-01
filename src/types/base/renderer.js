class Renderer {
    /**
     * @type {HTMLElement}
     */
    node

    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {ChartSettings}
     */
    settings

    /**
     * @type {DynSettings}
     */
    dynSettings

    /**
     * @type {Chart}
     */
    chart

    /**
     * @type {Animations}
     */
    animations

    /**
     * @param {Chart} chart
     * @param {ChartSettings} settings
     * @param {DynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        this.node = chart.node
        this.settings = settings
        this.dynSettings = dynSettings
        this.chart = chart
        this.animations = new Animations()

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