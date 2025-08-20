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
     * @type {OTooltip}
     */
    tooltip

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

        this.canvas.width = chart.settings.width
        this.canvas.height = chart.settings.height

        if (settings.enableLegend) {
            if (settings.legendPlace === OLegendPlaces.top || settings.legendPlace === OLegendPlaces.bottom)
                this.canvas.height -= 100

            if (settings.legendPlace === OLegendPlaces.left || settings.legendPlace === OLegendPlaces.right)
                this.canvas.width -= 500
        }

        this.node.append(this.canvas)

        this.tooltip = new OTooltip(this.canvas, settings)
    }

    render() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.settings.title) {
            ctx.beginPath()

            ctx.shadowBlur = null
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.font = '20px serif'
            ctx.fillText(this.settings.title, this.canvas.width / 2, 30)

            ctx.closePath()
        }
    }

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
    }

    refresh() {
        this.tooltip.refresh()
    }
}