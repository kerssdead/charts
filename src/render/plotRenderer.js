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
     * @type {number}
     */
    #tooltipX

    /**
     * @type {number}
     */
    #tooltipY

    /**
     * @type {Map<number, string>}
     */
    #labelsX

    /**
     * @type {Map<number, string>}
     */
    #labelsY

    /**
     * @type {any[]}
     */
    #allValuesX

    /**
     * @type {any[]}
     */
    #allValuesY

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = chart.data
        this.data.values = this.data.values.map(v => new OPlotSeries(v))

        if (this.data.values.filter(v => v.type === OPlotTypes.bar).length > 0) {
            for (let series of this.data.values) {
                for (let item of series.values) {
                    let x = item.x
                    item.x = item.y
                    item.y = x
                }

                series.values.sort((a, b) => b.x - a.x)
            }
        }

        const xValues = this.data.values.flatMap(s => s.values.map(p => p.x)),
            yValues = this.data.values.flatMap(s => s.values.map(p => p.y))

        this.#paddings = {
            top: 40,
            right: 60,
            bottom: 50,
            left: 80
        }

        if (settings.title)
            this.#paddings.top += 50

        if (this.data.xType === OPlotAxisType.date)
            xValues.sort((a, b) => a.getTime() - b.getTime())

        yValues.sort((a, b) => b - a)

        this.#allValuesX = [...new Set(xValues.filter(x => x !== undefined))]
        this.#allValuesY = [...new Set(yValues.filter(y => y !== undefined))]

        this.#x = {
            min: Math.min(...xValues),
            max: Math.max(...xValues),
            unit: (Math.abs(Math.min(...xValues)) + Math.abs(Math.max(...xValues))) / (this.#allValuesX.length - 1),
            step: (this.canvas.width - this.#paddings.left - this.#paddings.right) / this.#allValuesX.length,
            count: this.#allValuesX.length
        }

        let yMin = Math.min(...yValues)
        if (yMin > 0)
            yMin = 0

        this.#y = {
            min: yMin,
            max: this.data.yMax ?? Math.max(...yValues),
            unit: (Math.abs(yMin) + Math.abs(this.data.yMax ?? Math.max(...yValues))) / (this.#allValuesY.length - 1),
            step: (this.canvas.height - this.#paddings.top - this.#paddings.bottom) / this.#allValuesY.length,
            count: this.#allValuesY.length
        }

        let stackingColumns = this.data.values.filter(s => s.type === OPlotTypes.stackingColumn)

        if (stackingColumns.length > 0) {
            let values = stackingColumns.map(s => s.values.flatMap(v => +v.y))

            let max = this.#y.max

            for (let i = 0; i < values[0].length; i++) {
                let sum = 0

                for (const v of values)
                    sum += v[i]

                if (sum > max)
                    max = sum
            }

            this.#y.max = max > this.data.yMax ? this.data.yMax : max
            this.#y.unit = (Math.abs(this.#y.min) + Math.abs(this.#y.max)) / (this.#allValuesY.length - 1)
        }

        const yMaxWidth = OHelper.stringWidth(this.#y.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        if (yMaxWidth > this.#paddings.left - 40) {
            this.#paddings.left += yMaxWidth - this.#paddings.left + 40
            this.#x.step = (this.canvas.width - this.#paddings.left - this.#paddings.right) / this.#allValuesX.length
        }

        this.tooltip = new OTooltip(this.canvas, this.settings)

        this.#labelsX = new Map()
        this.#labelsY = new Map()

        this.#initAnimations()
    }

    render() {
        super.render()

        const axisLabelOffset = 12

        let tooltipText = ''

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.font = '14px serif'
        ctx.fillStyle = '#000000'
        ctx.shadowBlur = null

        const axisLineColor = '#0000001e',
            axisLineHoverColor = '#00000088'

        if (this.#onMouseMoveEvent) {
            let mouseX = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + window.scrollX,
                mouseY = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

            if (this.#paddings.left > mouseX || mouseX > this.canvas.width - this.#paddings.right
                || this.#paddings.top > mouseY || mouseY > this.canvas.height - this.#paddings.bottom) {
                this.#tooltipX = undefined
                this.#tooltipY = undefined
            }
        }

        if (this.#tooltipX)
            tooltipText = this.#labelsX.get(Math.round(this.#tooltipX))

        if (this.#tooltipY)
            tooltipText = this.#labelsY.get(Math.round(this.#tooltipY))

        const isContainsColumn = this.data.values.filter(s => s.type === OPlotTypes.column).length > 0
        const isContainsBar = this.data.values.filter(s => s.type === OPlotTypes.bar).length > 0

        if (this.data.xTitle || this.data.yTitle) {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'

            if (this.data.xTitle)
                ctx.fillText(this.data.xTitle,
                    this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) / 2,
                    this.canvas.height - 4)

            if (this.data.yMax) {
                ctx.rotate(-Math.PI / 2)

                ctx.textBaseline = 'top'

                ctx.fillText(this.data.yTitle,
                    -(this.#paddings.top + (this.canvas.height - this.#paddings.top - this.#paddings.bottom) / 2),
                    8)

                ctx.resetTransform()
            }
        }

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        const xCount = this.#x.count > 10 ? 10 : this.#x.count

        let xCounter = !isContainsBar ? 1 : 0,
            xStep = this.#allValuesX.length / xCount

        for (let i = !isContainsBar ? 1 : 0; i < this.#allValuesX.length + 1; i++) {
            const labelX = this.#paddings.left + xCounter * xStep * this.#x.step,
                labelXAsKey = Math.round(this.#paddings.left + i * this.#x.step)

            if (!this.#labelsX.has(labelXAsKey))
                this.#labelsX.set(labelXAsKey,
                    this.data.xType === OPlotAxisType.date
                        ? this.#allValuesX[i - 1].toLocaleDateString()
                        : isNaN(+this.#x.min) || !isFinite(+this.#x.min)
                            ? this.#allValuesX[i - 1]
                            : (this.#x.min + (i + (isContainsColumn ? -1 : 0)) * (this.#x.max - this.#x.min) / (this.#x.count - 1))
                                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

            const label = {
                x: labelX,
                y: this.canvas.height - this.#paddings.bottom,
                label: this.data.xType === OPlotAxisType.date
                    ? this.#allValuesX[i - 1].toLocaleDateString()
                    : isNaN(+this.#x.min) || !isFinite(+this.#x.min)
                        ? this.#allValuesX[i - 1]
                        : (this.#x.min + (i + (isContainsColumn ? -1 : 0)) * (this.#x.max - this.#x.min) / (this.#x.count - 1))
                            .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }

            let isRender = i >= xCounter * xStep

            if (isRender) {
                const textWidth = OHelper.stringWidth(label.label),
                    imageDataX = label.x,
                    imageData = new Uint32Array(ctx.getImageData(imageDataX - textWidth / 2, label.y + 4, textWidth > 0 ? textWidth : 1, 24).data.buffer)

                for (let i = 0; i < imageData.length; i++)
                    if (imageData[i] & 0xff000000) {
                        isRender = false
                        break
                    }
            }

            if(isRender) {
                ctx.fillText(label.label,
                    label.x - (!isContainsBar ? this.#x.step / 2 : 0),
                    label.y + axisLabelOffset)

                if (isContainsBar) {
                    ctx.beginPath()

                    ctx.moveTo(label.x, label.y)
                    ctx.lineTo(label.x, this.#paddings.top)

                    ctx.lineWidth = 1
                    ctx.strokeStyle = axisLineColor
                    ctx.stroke()

                    ctx.closePath()
                }

                xCounter++
            }
        }

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        let x = 0,
            y = 0

        let x1 = 0,
            y1 = 0

        let x11 = 0,
            y11 = 0

        let x1111 = 0,
            y1111 = 0

        const yCount = this.#y.count > 10 ? 10 : this.#y.count

        let yCounter = isContainsBar ? 1 : 0,
            yStep = this.#allValuesY.length / yCount

        for (let i = isContainsBar ? 1 : 0; i < this.#allValuesY.length + 1; i++) {
            const labelY = this.canvas.height - yCounter * yStep * this.#y.step - this.#paddings.bottom,
                labelYAsKey = Math.round(this.canvas.height - i * this.#y.step - this.#paddings.bottom)

            if (!this.#labelsY.get(labelYAsKey))
                this.#labelsY.set(labelYAsKey,
                    (this.#y.min + (i + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / (this.#y.count - 1))
                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

            let isRender = i >= yCounter * yStep

            if (isRender) {
                const label = {
                    x: this.#paddings.left,
                    y: labelY,
                    label: (this.#y.min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / (this.#y.count - 1))
                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }

                ctx.fillText(label.label,
                    label.x - axisLabelOffset,
                    label.y + (isContainsBar ? this.#y.step / 2 : 0))

                if (this.data.values.filter(s => s.type === OPlotTypes.column
                    || s.type === OPlotTypes.stackingColumn
                    || s.type === OPlotTypes.line)
                    .length > 0) {
                    ctx.beginPath()

                    ctx.moveTo(label.x, label.y)
                    ctx.lineTo(this.canvas.width - this.#paddings.right, label.y)

                    ctx.lineWidth = 1
                    ctx.strokeStyle = axisLineColor
                    ctx.stroke()

                    ctx.closePath()
                }

                yCounter++
            }
        }

        let isFirst = true

        ctx.closePath()

        let columnsIndex = 0,
            columnsCount = this.data.values.filter(s => s.type === OPlotTypes.column).length

        let barsIndex = 0,
            barsCount = this.data.values.filter(s => s.type === OPlotTypes.bar).length,
            barHeight = this.#y.step / (2 * barsCount)

        let stackingAccumulator = []

        for (let i = 0; i < this.#allValuesY.length; i++)
            stackingAccumulator.push(0)

        let isLast = false

        for (const series of this.data.values.filter(s => !s.disabled)) {
            let hoverX

            ctx.beginPath()

            ctx.strokeStyle = series.color
            ctx.fillStyle = series.color
            ctx.lineWidth = series.width

            for (const value of series.values) {
                const index = series.values.indexOf(value),
                    xIndex = this.#allValuesX.indexOf(value.x),
                    yIndex = this.#allValuesY.indexOf(value.y)

                const tooltipXValue = value.x ? (+value.x).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0',
                    tooltipYValue = value.y ? (+value.y).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'

                switch (series.type) {
                    case OPlotTypes.line:
                        const yCorrection = this.#y.min / this.#y.unit * this.#y.step

                        x = this.#paddings.left + (xIndex + .5) * this.#x.step
                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step + yCorrection - this.#y.step / 2

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

                                        x = this.#paddings.left + (xIndex + .5) * this.#x.step
                                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step + yCorrection - this.#y.step / 2

                                        const next = series.values[index - 1]

                                        let prevValue = {
                                            x: this.#paddings.left + (xIndex - .5) * this.#x.step,
                                            y: this.canvas.height - this.#paddings.bottom - next.y / this.#y.unit * this.#y.step + yCorrection - this.#y.step / 2
                                        }

                                        ctx.lineTo(prevValue.x + (x - prevValue.x) * transition,
                                            prevValue.y + (y - prevValue.y) * transition)
                                    }
                                })
                        } else {
                            if (this.#isOnX(x)) {
                                hoverX = {
                                    x: x,
                                    y: y,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${tooltipYValue}`
                                this.#tooltipX = x + this.#x.step / 2
                            }
                        }

                        if (isFirst) {
                            ctx.moveTo(x, y)
                            isFirst = false
                        } else {
                            if (!(!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)))
                                ctx.lineTo(x, y)
                        }

                        break

                    case OPlotTypes.attentionLine:
                        let yValue = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step

                        ctx.strokeStyle = series.color
                        ctx.lineWidth = series.width

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

                                        if (passed === duration)
                                            this.animations.delete({ id: value.id }, OAnimationTypes.init)
                                    }
                                })
                        }

                        if (!(!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)))
                            ctx.lineTo(this.canvas.width - this.#paddings.right, yValue)

                        break

                    case OPlotTypes.column:
                        const yCorr = this.#y.min / this.#y.unit * this.#y.step

                        let yValue11 = value.y > this.data.yMax ? this.data.yMax : value.y

                        x1 = this.#paddings.left + xIndex * this.#x.step
                        y1 = this.canvas.height - this.#paddings.bottom - yValue11 / this.#y.unit * this.#y.step + yCorr

                        let columnWidth = this.#x.step * (series.width ? series.width / 100 : .5) / columnsCount

                        const isInitInProgress = !this.#isInit || this.animations.contains({ id: value.id + columnsIndex }, OAnimationTypes.init)

                        if (isInitInProgress) {
                            this.animations.add({ id: value.id + columnsIndex },
                                OAnimationTypes.init,
                                {
                                    timer: null,
                                    duration: 800,
                                    body: (passed, duration) => {
                                        if (passed > duration)
                                            passed = duration

                                        const transition = passed / duration

                                        x1 = this.#paddings.left + xIndex * this.#x.step
                                        y1 = this.canvas.height - this.#paddings.bottom - yValue11 / this.#y.unit * this.#y.step + yCorr

                                        columnsIndex = this.data.values.filter(s => s.type === OPlotTypes.column)
                                            .indexOf(series)

                                        ctx.fillRect(x1 + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                            this.canvas.height - this.#paddings.bottom,
                                            columnWidth,
                                            (y1 - this.canvas.height + this.#paddings.bottom) * transition)

                                        if (passed === duration)
                                            this.animations.delete({ id: value.id + columnsIndex }, OAnimationTypes.init)
                                    }
                                })
                        } else {
                            ctx.fillRect(x1 + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                this.canvas.height - this.#paddings.bottom,
                                columnWidth,
                                y1 - this.canvas.height + this.#paddings.bottom)

                            if (this.#isOnX(x1 + this.#x.step / 2)) {
                                isLast = this.data.values.filter(s => (s.type === OPlotTypes.column || s.type === OPlotTypes.stackingColumn)
                                        && s.values.filter(v => v.x === value.x).length > 0).length - 1
                                    <= columnsIndex

                                hoverX = {
                                    x: x1,
                                    y: y1,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${tooltipYValue}`
                                this.#tooltipX = x1 + this.#x.step
                            }
                        }

                        break

                    case OPlotTypes.bar:
                        x11 = this.#paddings.left
                        y11 = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2

                        const isInitInProgress1 = !this.#isInit || this.animations.contains({ id: value.id + barsIndex }, OAnimationTypes.init)

                        if (isInitInProgress1) {
                            this.animations.add({ id: value.id + barsIndex },
                                OAnimationTypes.init,
                                {
                                    timer: null,
                                    duration: 800,
                                    body: (passed, duration) => {
                                        if (passed > duration)
                                            passed = duration

                                        const transition = passed / duration

                                        x11 = this.#paddings.left
                                        y11 = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2

                                        barsIndex = this.data.values.filter(s => s.type === OPlotTypes.bar)
                                            .indexOf(series)

                                        ctx.fillRect(x11,
                                            y11 - this.#y.step / 4 + barsIndex * barHeight,
                                            value.x / this.#x.unit * this.#x.step * transition,
                                            barHeight)

                                        if (passed === duration)
                                            this.animations.delete({ id: value.id + barsIndex }, OAnimationTypes.init)
                                    }
                                })
                        } else {
                            ctx.fillRect(x11,
                                y11 - this.#y.step / 4 + barsIndex * barHeight,
                                value.x / this.#x.unit * this.#x.step,
                                barHeight)

                            if (this.#isOnY(y11)) {
                                hoverX = {
                                    x: x11,
                                    y: y11,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${tooltipXValue}`
                                this.#tooltipY = y11 - this.#y.step / 2
                            }
                        }

                        break

                    case OPlotTypes.stackingColumn:
                        const yCorr22 = this.#y.min / this.#y.unit * this.#y.step

                        x1111 = this.#paddings.left + xIndex * this.#x.step
                        y1111 = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step + yCorr22

                        let columnWidth1 = this.#x.step * (series.width ? series.width / 100 : .5)

                        const isInitInProgress22 = !this.#isInit || this.animations.contains({ id: value.id + index }, OAnimationTypes.init)

                        if (isInitInProgress22) {
                            this.animations.add({ id: value.id + index },
                                OAnimationTypes.init,
                                {
                                    timer: null,
                                    duration: 800,
                                    body: (passed, duration) => {
                                        if (passed > duration)
                                            passed = duration

                                        const transition = passed / duration

                                        columnsIndex = this.data.values.filter(s => s.type === OPlotTypes.stackingColumn && s.values.filter(v => v.x === value.x).length > 0)
                                            .indexOf(series)

                                        x1111 = this.#paddings.left + xIndex * this.#x.step
                                        y1111 = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step + yCorr22

                                        if (columnsIndex === 0)
                                            stackingAccumulator[xIndex] = 0

                                        let offset = stackingAccumulator[xIndex] !== undefined
                                            ? stackingAccumulator[xIndex]
                                            : 0

                                        let yValue2 = this.canvas.height - this.#paddings.bottom + offset,
                                            yHeight2 = (y1111 - this.canvas.height + this.#paddings.bottom) * transition

                                        if (yValue2 > this.#paddings.top) {
                                            if (yValue2 + yHeight2 < this.#paddings.top)
                                                yHeight2 -= yValue2 + yHeight2 - this.#paddings.top

                                            ctx.fillRect(x1111 + (this.#x.step - columnWidth1) / 2,
                                                yValue2,
                                                columnWidth1,
                                                yHeight2)
                                        }

                                        stackingAccumulator[xIndex] += (y1111 - this.canvas.height + this.#paddings.bottom) * transition

                                        if (passed === duration)
                                            this.animations.delete({ id: value.id + index }, OAnimationTypes.init)
                                    }
                                })
                        } else {
                            let offset = stackingAccumulator[xIndex] !== undefined
                                ? stackingAccumulator[xIndex]
                                : 0

                            let yValue22 = this.canvas.height - this.#paddings.bottom + offset,
                                yHeight22 = y1111 - this.canvas.height + this.#paddings.bottom

                            if (yValue22 > this.#paddings.top) {
                                if (yValue22 + yHeight22 < this.#paddings.top) {
                                    yHeight22 -= yValue22 + yHeight22 - this.#paddings.top
                                }

                                ctx.fillRect(x1111 + (this.#x.step - columnWidth1) / 2,
                                    yValue22,
                                    columnWidth1,
                                    yHeight22)
                            }

                            stackingAccumulator[xIndex] += (y1111 - this.canvas.height + this.#paddings.bottom)

                            if (this.#isOnX(x1111 + this.#x.step / 2)) {
                                isLast = this.data.values.filter(s => (s.type === OPlotTypes.column || s.type === OPlotTypes.stackingColumn)
                                    && s.values.filter(v => v.x === value.x).length > 0).length - 1
                                    <= columnsIndex

                                hoverX = {
                                    x: x1111,
                                    y: y1111,
                                    index: xIndex
                                }

                                tooltipText += `\n${series.label}: ${tooltipYValue}`
                                this.#tooltipX = x1111 + this.#x.step
                            }
                        }

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

                case OPlotTypes.column:
                case OPlotTypes.stackingColumn:
                    if (hoverX && isLast) {
                        let offset = stackingAccumulator[hoverX.index] !== undefined
                            ? stackingAccumulator[hoverX.index]
                            : 0

                        if (this.canvas.height - this.#paddings.bottom + offset > this.#paddings.top) {
                            ctx.lineWidth = 1
                            ctx.strokeStyle = axisLineHoverColor
                            ctx.moveTo(this.#tooltipX - this.#x.step / 2,
                                this.#paddings.top)
                            ctx.lineTo(this.#tooltipX - this.#x.step / 2,
                                this.canvas.height - this.#paddings.bottom + offset)
                            ctx.stroke()
                        }
                    }

                    columnsIndex++

                    break

                case OPlotTypes.bar:
                    if (hoverX) {
                        ctx.lineWidth = 1
                        ctx.strokeStyle = axisLineHoverColor
                        ctx.moveTo(this.#paddings.left,
                            this.#tooltipY + this.#y.step / 2)
                        ctx.lineTo(this.canvas.width - this.#paddings.right,
                            this.#tooltipY + this.#y.step / 2)
                        ctx.stroke()
                    }

                    barsIndex++

                    break
            }

            isFirst = true
        }

        ctx.beginPath()

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

    /**
     * @param x {number}
     *
     * @returns {boolean}
     */
    #isOnX(x) {
        if (!this.#onMouseMoveEvent)
            return false

        let mouseX = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + window.scrollX,
            mouseY = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

        return x - this.#x.step / 2 <= mouseX && mouseX < x + this.#x.step / 2
            && this.#paddings.top <= mouseY && mouseY <= this.canvas.height - this.#paddings.bottom
            && this.#paddings.left < mouseX
    }

    /**
     * @param y {number}
     *
     * @returns {boolean}
     */
    #isOnY(y) {
        if (!this.#onMouseMoveEvent)
            return false

        let mouseX = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + window.scrollX,
            mouseY = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

        return y - this.#y.step / 2 <= mouseY && mouseY < y + this.#y.step / 2
            && this.#paddings.left <= mouseX && mouseX <= this.canvas.width - this.#paddings.right
    }
}