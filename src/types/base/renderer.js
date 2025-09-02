import { OAnimations } from '/src/animations.js'
import { OTooltip } from '/src/tooltip.js'
import { OLegend } from '/src/legend.js'
import { OLegendPlaces } from '/src/enums.js'

export class ORenderer {
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
     */
    constructor(chart, settings) {
        this.node = chart.node
        this.settings = settings
        this.chart = chart
        this.animations = new OAnimations()

        this.canvas = document.createElement('canvas')

        this.#calculateSizes()

        this.node.append(this.canvas)

        this.tooltip = new OTooltip(this.canvas, settings)
    }

    render() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

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

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
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
            if (this.settings.legendPlace === OLegendPlaces.top || this.settings.legendPlace === OLegendPlaces.bottom)
                this.canvas.height -= OLegend.getLegendHeight(this.settings.data.values, this.canvas.width)

            if (this.settings.legendPlace === OLegendPlaces.left || this.settings.legendPlace === OLegendPlaces.right)
                this.canvas.width -= 500
        }
    }
}