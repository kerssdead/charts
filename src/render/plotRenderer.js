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
     * @type {OPaddings}
     */
    #paddings

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {MouseEvent}
     */
    #onMouseMoveEvent

    /**
     * @type {MouseEvent}
     */
    #onClickEvent

    /**
     * @type {boolean}
     */
    #isInit

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = chart.data
        this.data.values = this.data.values.map(v => new OPlotSeries(v))

        const xValues = this.data.values.flatMap(s => s.values.map(p => p.x)).filter(value => !isNaN(value)),
            yValues = this.data.values.flatMap(s => s.values.map(p => p.y)).filter(value => !isNaN(value))

        this.#paddings = {
            top: 40,
            right: 100,
            bottom: 40,
            left: 100
        }

        if (settings.title)
            this.#paddings.top += 50

        this.#x = {
            min: Math.min(...xValues),
            max: Math.max(...xValues),
            unit: (Math.abs(Math.min(...xValues)) + Math.abs(Math.max(...xValues))) / (this.data.values[0].values.length - 1),
            step: (this.canvas.width - this.#paddings.left - this.#paddings.right) / this.data.values[0].values.length,
            count: this.data.values[0].values.length
        }
        this.#y = {
            min: Math.min(...yValues),
            max: Math.max(...yValues),
            unit: (Math.abs(Math.min(...yValues)) + Math.abs(Math.max(...yValues))) / (this.data.values[0].values.length - 1),
            step: (this.canvas.height - this.#paddings.top - this.#paddings.bottom) / this.data.values[0].values.length,
            count: this.data.values[0].values.length
        }

        this.tooltip = new OTooltip(this.canvas, this.settings)

        this.#initAnimations()
    }

    render() {
        super.render()

        const axisLabelOffset = 12

        let tooltipText

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1

        ctx.moveTo(this.#paddings.left, this.canvas.height - this.#paddings.bottom)
        ctx.lineTo(this.canvas.width - this.#paddings.right, this.canvas.height - this.#paddings.bottom)
        ctx.stroke()

        ctx.moveTo(this.#paddings.left, this.canvas.height - this.#paddings.bottom)
        ctx.lineTo(this.#paddings.left, this.#paddings.top)
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.font = '14px serif'

        const axisLineColor = '#0000001e'

        for (let i = 1; i < this.data.values[0].values.length; i++) {
            const label = {
                x: this.#paddings.left + i * this.#x.step,
                y: this.canvas.height - this.#paddings.bottom
            }

            ctx.fillText((this.#x.min + i * (this.#x.max - this.#x.min) / (this.#x.count - 1)).toFixed(2),
                label.x,
                label.y + axisLabelOffset)

            ctx.beginPath()

            ctx.moveTo(label.x, label.y)
            ctx.lineTo(label.x, this.#paddings.top)

            ctx.lineWidth = 1
            ctx.strokeStyle = axisLineColor
            ctx.stroke()

            ctx.closePath()
        }

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        for (let i = 1; i < this.data.values[0].values.length; i++) {
            const label = {
                x: this.#paddings.left,
                y: this.canvas.height - i * this.#y.step - this.#paddings.bottom
            }

            ctx.fillText((this.#y.min + i * (this.#y.max - this.#y.min) / (this.#y.count - 1)).toFixed(2),
                label.x - axisLabelOffset,
                label.y)

            ctx.beginPath()

            ctx.moveTo(label.x, label.y)
            ctx.lineTo(this.canvas.width - this.#paddings.right, label.y)

            ctx.lineWidth = 1
            ctx.strokeStyle = axisLineColor
            ctx.stroke()

            ctx.closePath()
        }

        let isFirst = true

        ctx.closePath()

        for (const series of this.data.values.filter(s => !s.disabled)) {
            let hoverX

            ctx.beginPath()

            ctx.strokeStyle = series.color
            ctx.fillStyle = series.color
            ctx.lineWidth = series.width

            for (const value of series.values) {
                const index = series.values.indexOf(value)

                switch (series.type) {
                    case OPlotTypes.line:
                        const yCorrection = this.#y.min / this.#y.unit * this.#y.step

                        let x = this.#paddings.left + index * this.#x.step,
                            y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step + yCorrection

                        const pointDuration = 1500 / series.values.length * 1.2

                        if (!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id },
                                OAnimationTypes.init,
                                {
                                    timer: null,
                                    duration: index * pointDuration,
                                    before: (item, passed, duration) => {
                                        return passed < duration && index > 0
                                    },
                                    body: (passed, duration) => {
                                        if (passed > duration)
                                            passed = duration

                                        if (index > 0) {
                                            passed -= (index - 1) * pointDuration
                                            duration = pointDuration
                                        }

                                        if (passed < 0)
                                            return

                                        const transition = passed / duration

                                        const next = series.values[index - 1]

                                        let prevValue = {
                                            x: this.#paddings.left + (index - 1) * this.#x.step,
                                            y: this.canvas.height - this.#paddings.bottom - next.y / this.#y.unit * this.#y.step + yCorrection
                                        }

                                        ctx.lineTo(prevValue.x + (x - prevValue.x) * transition,
                                            prevValue.y + (y - prevValue.y) * transition)
                                    }
                                })
                        }

                        if (isFirst) {
                            ctx.moveTo(x, y)
                            isFirst = false
                        } else {
                            if (!(!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)))
                                ctx.lineTo(x, y)
                        }

                        if (this.#isOnX(x)) {
                            hoverX = {
                                x: x,
                                y: y
                            }

                            tooltipText = `${series.label}: ${value.label} ${value.x.toFixed(2)} ${value.y.toFixed(2)}`
                        }

                        break

                    case OPlotTypes.attentionLine:
                        let yValue = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step

                        ctx.strokeStyle = series.color

                        ctx.moveTo(this.#paddings.left, yValue)

                        if (!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id },
                                OAnimationTypes.init,
                                {
                                    timer: null,
                                    duration: 1500,
                                    before: (item, passed, duration) => {
                                        return passed < duration && index > 0
                                    },
                                    body: (passed, duration) => {
                                        if (passed > duration)
                                            passed = duration

                                        if (passed < 0)
                                            return

                                        const transition = 1 - passed / duration

                                        ctx.lineTo(this.canvas.width - this.#paddings.right - (this.canvas.width - this.#paddings.left - this.#paddings.right) * transition,
                                            yValue)
                                    }
                                })
                        }

                        if (!(!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)))
                            ctx.lineTo(this.canvas.width - this.#paddings.right, yValue)

                        break
                }
            }

            switch (series.type) {
                case OPlotTypes.line:
                    ctx.stroke()

                    ctx.closePath()

                    if (hoverX) {
                        ctx.beginPath()
                        ctx.arc(hoverX.x, hoverX.y, 5, 0, 2 * Math.PI)
                        ctx.fill()
                    }

                    break

                case OPlotTypes.attentionLine:
                    ctx.stroke()
                    ctx.closePath()

                    ctx.fillStyle = '#000000'
                    ctx.font = '14px serif'
                    ctx.textBaseline = 'top'
                    ctx.textAlign = 'center'

                    ctx.fillText(series.label,
                        this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) / 2,
                        this.canvas.height - this.#paddings.bottom - series.values[0].y / this.#y.unit * this.#y.step + 8)

                    break
            }

            isFirst = true
        }

        this.tooltip.render(!!tooltipText, this.#onMouseMoveEvent, tooltipText)

        requestAnimationFrame(this.render.bind(this))

        this.#isInit = true
    }

    destroy() {

    }

    refresh() {
        super.refresh()
    }

    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY

        this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
        this.canvas.onclick = event => this.#onClickEvent = event
    }

    #isOnX(x) {
        if (!this.#onMouseMoveEvent)
            return false

        let mouseX = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + window.scrollX,
            mouseY = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

        return x - this.#x.step / 2 <= mouseX && mouseX < x + this.#x.step / 2
            && this.#paddings.top <= mouseY && mouseY <= this.canvas.height - this.#paddings.bottom
            && this.#paddings.left < mouseX
    }
}