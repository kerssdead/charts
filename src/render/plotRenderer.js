class OPlotRenderer extends ORenderer {
    /**
     * @type {OPlotData}
     */
    data

    /**
     * @type {OPlotAxis}
     */
    #x

    /**
     * @type {OPlotAxis}
     */
    #y

    /**
     * @type {number}
     */
    #topOffset

    /**
     * @type {OPoint}
     */
    #paddings

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = chart.data

        const xValues = this.data.values[0].values.map(p => p.x),
            yValues = this.data.values[0].values.map(p => p.y)

        this.#topOffset = settings.title ? 50 : 0

        this.#paddings = {
            x: 100,
            y: 40
        }

        this.#x = {
            min: Math.min(...xValues),
            max: Math.max(...xValues),
            unit: (Math.abs(Math.min(...xValues)) + Math.abs(Math.max(...xValues))) / (this.data.values[0].values.length - 1),
            step: (this.canvas.width - this.#paddings.x * 2) / this.data.values[0].values.length,
            count: this.data.values[0].values.length
        }
        this.#y = {
            min: Math.min(...yValues),
            max: Math.max(...yValues),
            unit: (Math.abs(Math.min(...yValues)) + Math.abs(Math.max(...yValues))) / (this.data.values[0].values.length - 1),
            step: (this.canvas.height - this.#paddings.y * 2 - this.#topOffset) / this.data.values[0].values.length,
            count: this.data.values[0].values.length
        }
    }

    render() {
        super.render()

        const axisLabelOffset = 12

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1

        ctx.moveTo(this.#paddings.x, this.canvas.height - this.#paddings.y)
        ctx.lineTo(this.canvas.width - this.#paddings.x, this.canvas.height - this.#paddings.y)
        ctx.stroke()

        ctx.moveTo(this.#paddings.x, this.canvas.height - this.#paddings.y)
        ctx.lineTo(this.#paddings.x, this.#paddings.y + this.#topOffset)
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.font = '14px serif'

        const axisLineColor = '#0000001e'

        for (let i = 1; i < this.data.values[0].values.length; i++) {
            const label = {
                x: this.#paddings.x + i * this.#x.step,
                y: this.canvas.height - this.#paddings.y
            }

            ctx.fillText((this.#x.min + i * (this.#x.max - this.#x.min) / (this.#x.count - 1)).toFixed(2),
                label.x,
                label.y + axisLabelOffset)

            ctx.beginPath()

            ctx.moveTo(label.x, label.y)
            ctx.lineTo(label.x, this.#paddings.y + this.#topOffset)

            ctx.lineWidth = 1
            ctx.strokeStyle = axisLineColor
            ctx.stroke()

            ctx.closePath()
        }

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        for (let i = 1; i < this.data.values[0].values.length; i++) {
            const label = {
                x: this.#paddings.x,
                y: this.canvas.height - i * this.#y.step - this.#paddings.y
            }

            ctx.fillText((this.#y.min + i * (this.#y.max - this.#y.min) / (this.#y.count - 1)).toFixed(2),
                label.x - axisLabelOffset,
                label.y)

            ctx.beginPath()

            ctx.moveTo(label.x, label.y)
            ctx.lineTo(this.canvas.width - this.#paddings.x, label.y)

            ctx.lineWidth = 1
            ctx.strokeStyle = axisLineColor
            ctx.stroke()

            ctx.closePath()
        }

        let isFirst = true

        ctx.closePath()

        for (const series of this.data.values) {
            ctx.beginPath()

            ctx.strokeStyle = series.color
            ctx.lineWidth = series.width

            for (const value of series.values) {
                const x = this.#paddings.x + series.values.indexOf(value) * this.#x.step,
                    y = this.canvas.height - this.#paddings.y - value.y / this.#y.unit * this.#y.step

                if (isFirst) {
                    ctx.moveTo(x, y)
                    isFirst = false
                } else {
                    ctx.lineTo(x, y)
                }
            }

            ctx.stroke()

            isFirst = true
        }
    }

    destroy() {

    }

    refresh() {
        super.refresh()
    }
}