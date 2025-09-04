class Renderer {
    node: HTMLElement

    canvas: HTMLCanvasElement

    settings: ChartSettings

    chart: Chart

    animations: Animations

    tooltip: Tooltip

    constructor(chart: Chart, settings: ChartSettings) {
        this.node = chart.node
        this.settings = settings
        this.chart = chart
        this.animations = new Animations()

        this.canvas = document.createElement('canvas')

        this.#calculateSizes()

        this.node.append(this.canvas)

        this.tooltip = new Tooltip(this.canvas, settings)
    }

    /**
     * @throws {Error}
     */
    render() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx)
            throw Helpers.Errors.nullContext

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.settings.title) {
            ctx.beginPath()

            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.font = '20px serif'
            ctx.fillText(this.settings.title, this.canvas.width / 2, 30)

            ctx.closePath()
        }
    }

    refresh() {
        this.tooltip.refresh()
    }

    resize() {
        this.#calculateSizes()
        this.tooltip.refresh()
    }

    resetMouse() { }

    #calculateSizes() {
        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = this.chart.settings.width < domRect.width || domRect.width === 0
            ? this.chart.settings.width
            : domRect.width
        this.canvas.height = this.chart.settings.height < domRect.height || domRect.height === 0
            ? this.chart.settings.height
            : domRect.height

        if (this.settings.enableLegend) {
            if (this.settings.legendPlace === LegendPlace.Top || this.settings.legendPlace === LegendPlace.Bottom)
                this.canvas.height -= Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

            if (this.settings.legendPlace === LegendPlace.Left || this.settings.legendPlace === LegendPlace.Right)
                this.canvas.width -= 500
        }
    }
}