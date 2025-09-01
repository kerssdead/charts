import { ORenderer } from '/src/types/base/renderer.js'
import { OPlotAxisTypes, OPlotTypes, OAnimationTypes } from '/src/enums.js'
import { OPlotSeries } from '/src/types/plotSeries.js'
import { OHelper } from '/src/helper.js'
import { OTooltip } from '/src/tooltip.js'

export class OPlotRenderer extends ORenderer {
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
     * @type {ImageData}
     */
    #base

    /**
     * @type {number}
     */
    #yAxisStep

    /**
     * @type {DOMRect}
     */
    #plot

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
                    const x = item.x
                    item['x'] = item.y
                    item['y'] = x
                }

                series.values.sort((a, b) => b.x - a.x)
            }
        }

        this.#paddings = {
            top: 30,
            right: 40,
            bottom: 50,
            left: 80
        }

        if (settings.title)
            this.#paddings.top += 50

        this.#calculateSizes()

        this.tooltip = new OTooltip(this.canvas, this.settings)

        this.#labelsX = new Map()
        this.#labelsY = new Map()

        this.#initAnimations()
    }

    render() {
        super.render()

        let tooltipText = this.#tooltipX
            ? this.#labelsX.get(Math.round(this.#tooltipX))
            : this.#tooltipY
                ? this.#labelsY.get(Math.round(this.#tooltipY))
                : undefined

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.font = '14px serif'
        ctx.fillStyle = '#000000'
        ctx.lineJoin = 'round'

        const axisLineHoverColor = '#00000088'

        this.#renderBase()

        let x = 0,
            y = 0,
            yValue = 0,
            yHeight = 0,
            columnWidth = 0

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
                let index = series.values.indexOf(value),
                    xIndex = this.#allValuesX.indexOf(value.x),
                    yIndex = this.#allValuesY.indexOf(value.y)

                const getTooltipValue = () => {
                    return {
                        x: value.x
                            ? this.data.xType === OPlotAxisTypes.date
                                ? this.#allValuesX[xIndex]
                                : this.#allValuesX[xIndex].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '0',
                        y: value.y
                            ? this.#allValuesY[yIndex].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '0'
                    }
                }

                if (series.type === OPlotTypes.line)
                    xIndex += 1

                x = this.#paddings.left
                if (series.type !== OPlotTypes.bar)
                    x += xIndex * this.#x.step

                switch (series.type) {
                    case OPlotTypes.line:
                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step - this.#y.step / 2
                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                        const pointDuration = 1500 / series.values.length * 1.2

                        if (!this.#isInit || this.animations.contains({ id: value.id }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id },
                                OAnimationTypes.init,
                                {
                                    duration: index * pointDuration,
                                    continuous: true,
                                    body: transition => {
                                        transition = (transition * index * pointDuration - (index - 1) * pointDuration) / pointDuration

                                        if (index === 0 || transition < 0)
                                            return

                                        x = this.#paddings.left + xIndex * this.#x.step
                                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step - this.#y.step / 2
                                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                                        const next = series.values[index - 1]

                                        let prevValue = {
                                            x: this.#paddings.left + (xIndex - 1) * this.#x.step,
                                            y: this.canvas.height - this.#paddings.bottom - next.y / this.#y.unit * this.#y.step - this.#y.step / 2
                                                - Math.abs(this.#y.min / this.#y.unit * this.#y.step)
                                        }

                                        ctx.lineTo(prevValue.x + (x - prevValue.x) * transition,
                                            prevValue.y + (y - prevValue.y) * transition)
                                    }
                                })
                        } else {
                            ctx.lineTo(x, y)

                            if (this.#isOnX(x)) {
                                hoverX = {
                                    x: x,
                                    y: y,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${getTooltipValue().y}`
                                this.#tooltipX = x + this.#x.step / 2
                            }
                        }

                        break

                    case OPlotTypes.attentionLine:
                        yValue = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step

                        ctx.moveTo(this.#paddings.left, yValue)

                        if (!this.#isInit || this.animations.contains(value, OAnimationTypes.init))
                            this.animations.add(value,
                                OAnimationTypes.init,
                                {
                                    duration: 1500,
                                    continuous: true,
                                    body: transition => {
                                        ctx.lineTo(this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) * transition,
                                            this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step)
                                    }
                                })
                        else
                            ctx.lineTo(this.canvas.width - this.#paddings.right, yValue)

                        break

                    case OPlotTypes.column:
                        yValue = value.y > this.data.yMax ? this.data.yMax : value.y

                        y = this.#plot.height * yValue / this.#y.max

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5) / columnsCount

                        if (!this.#isInit || this.animations.contains({ id: value.id + columnsIndex }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id + columnsIndex },
                                OAnimationTypes.init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        yValue = value.y > this.data.yMax ? this.data.yMax : value.y

                                        x = this.#paddings.left + xIndex * this.#x.step
                                        y = this.#plot.height * yValue / this.#y.max * transition

                                        columnsIndex = this.data.values.filter(s => s.type === OPlotTypes.column)
                                            .indexOf(series)

                                        ctx.fillRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                            this.canvas.height - this.#paddings.bottom - y,
                                            columnWidth,
                                            y)
                                    }
                                })
                        } else {
                            ctx.fillRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                this.canvas.height - this.#paddings.bottom - y,
                                columnWidth,
                                y)

                            if (this.#isOnX(x + this.#x.step / 2)) {
                                isLast = this.data.values.filter(s => (s.type === OPlotTypes.column || s.type === OPlotTypes.stackingColumn)
                                        && s.values.filter(v => v.x === value.x).length > 0).length - 1
                                    <= columnsIndex

                                hoverX = {
                                    x: x,
                                    y: y,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${getTooltipValue().y}`
                                this.#tooltipX = x + this.#x.step
                            }
                        }

                        break

                    case OPlotTypes.bar:
                        y = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2

                        if (!this.#isInit || this.animations.contains({ id: value.id + barsIndex }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id + barsIndex },
                                OAnimationTypes.init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        y = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2

                                        barsIndex = this.data.values.filter(s => s.type === OPlotTypes.bar)
                                            .indexOf(series)

                                        ctx.fillRect(x,
                                            y - this.#y.step / 4 + barsIndex * barHeight,
                                            value.x / this.#x.unit * this.#x.step * transition,
                                            barHeight)
                                    }
                                })
                        } else {
                            ctx.fillRect(x,
                                y - this.#y.step / 4 + barsIndex * barHeight,
                                value.x / this.#x.unit * this.#x.step,
                                barHeight)

                            if (this.#isOnY(y)) {
                                hoverX = {
                                    x: x,
                                    y: y,
                                    index: index
                                }

                                tooltipText += `\n${series.label}: ${getTooltipValue().x}`
                                this.#tooltipY = y - this.#y.step / 2
                            }
                        }

                        break

                    case OPlotTypes.stackingColumn:
                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5)

                        if (!this.#isInit || this.animations.contains({ id: value.id + index }, OAnimationTypes.init)) {
                            this.animations.add({ id: value.id + index },
                                OAnimationTypes.init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        columnsIndex = this.data.values.filter(s => s.type === OPlotTypes.stackingColumn && s.values.filter(v => v.x === value.x).length > 0)
                                            .indexOf(series)

                                        x = this.#paddings.left + xIndex * this.#x.step
                                        y = this.canvas.height - this.#paddings.bottom - value.y / this.#y.unit * this.#y.step

                                        if (columnsIndex === 0)
                                            stackingAccumulator[xIndex] = 0

                                        let offset = stackingAccumulator[xIndex] !== undefined
                                            ? stackingAccumulator[xIndex]
                                            : 0

                                        yValue = this.canvas.height - this.#paddings.bottom + offset
                                        yHeight = (y - this.canvas.height + this.#paddings.bottom) * transition

                                        if (yValue > this.#paddings.top) {
                                            if (yValue + yHeight < this.#paddings.top)
                                                yHeight -= yValue + yHeight - this.#paddings.top

                                            ctx.fillRect(x + (this.#x.step - columnWidth) / 2,
                                                yValue,
                                                columnWidth,
                                                yHeight)
                                        }

                                        stackingAccumulator[xIndex] += (y - this.canvas.height + this.#paddings.bottom) * transition
                                    }
                                })
                        } else {
                            let offset = stackingAccumulator[xIndex] !== undefined
                                ? stackingAccumulator[xIndex]
                                : 0

                            yValue = this.canvas.height - this.#paddings.bottom + offset
                            yHeight = y - this.canvas.height + this.#paddings.bottom

                            if (yValue > this.#paddings.top) {
                                if (yValue + yHeight < this.#paddings.top) {
                                    yHeight -= yValue + yHeight - this.#paddings.top
                                }

                                ctx.fillRect(x + (this.#x.step - columnWidth) / 2,
                                    yValue,
                                    columnWidth,
                                    yHeight)
                            }

                            stackingAccumulator[xIndex] += (y - this.canvas.height + this.#paddings.bottom)

                            if (this.#isOnX(x + this.#x.step / 2)) {
                                isLast = this.data.values.filter(s => (s.type === OPlotTypes.column || s.type === OPlotTypes.stackingColumn)
                                    && s.values.filter(v => v.x === value.x).length > 0).length - 1
                                    <= columnsIndex

                                hoverX = {
                                    x: x,
                                    y: y,
                                    index: xIndex
                                }

                                tooltipText += `\n${series.label}: ${getTooltipValue().y}`
                                this.#tooltipX = x + this.#x.step
                            }
                        }

                        break
                }
            }

            switch (series.type) {
                case OPlotTypes.line:
                    ctx.stroke()

                    if (hoverX) {
                        ctx.beginPath()
                        ctx.arc(hoverX.x, hoverX.y, 5, 0, 2 * Math.PI)
                        ctx.fill()
                    }

                    break

                case OPlotTypes.attentionLine:
                    ctx.stroke()

                    ctx.fillStyle = '#000000'
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
        }

        ctx.beginPath()

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1

        if (this.data.values.filter(v => v.type === OPlotTypes.bar).length > 0) {
            ctx.moveTo(this.#paddings.left, this.canvas.height - this.#paddings.bottom)
            ctx.lineTo(this.#paddings.left, this.#paddings.top)
            ctx.stroke()
        } else {
            ctx.moveTo(this.#paddings.left, this.canvas.height - this.#paddings.bottom)
            ctx.lineTo(this.canvas.width - this.#paddings.right, this.canvas.height - this.#paddings.bottom)
            ctx.stroke()
        }

        this.tooltip.render(tooltipText && tooltipText.includes('\n'), this.#onMouseMoveEvent, tooltipText)

        requestAnimationFrame(this.render.bind(this))

        this.#isInit = true
    }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.#base = null

        this.#calculateSizes()
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

    #renderBase() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        if (this.#base) {
            ctx.putImageData(this.#base, 0, 0)
            return
        }

        const axisLabelOffset = 12
        const axisLineColor = '#0000001e'

        const isContainsColumn = this.data.values.filter(s => s.type === OPlotTypes.column).length > 0,
            isContainsBar = this.data.values.filter(s => s.type === OPlotTypes.bar).length > 0

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
                    this.data.xType === OPlotAxisTypes.date
                        ? this.#allValuesX[i - 1].toLocaleDateString()
                        : isNaN(+this.#x.min) || !isFinite(+this.#x.min)
                            ? this.#allValuesX[i - 1]
                            : (this.#x.min + (i + (isContainsColumn ? -1 : 0)) * (this.#x.max - this.#x.min) / (this.#x.count - 1))
                                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

            const label = {
                x: labelX,
                y: this.canvas.height - this.#paddings.bottom,
                label: this.data.xType === OPlotAxisTypes.date
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
                }

                xCounter++
            }
        }

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

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
                    label: Math.round((this.#y.min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / (this.#y.count - 1)) / this.#yAxisStep) * this.#yAxisStep
                }

                if (this.data.shortLabels) {
                    let countOfTens = 0
                    while (label.label >= 1000) {
                        label.label /= 1000
                        countOfTens++
                    }

                    let postfix = ''
                    switch (countOfTens) {
                        case 1:
                            postfix = 'K'
                            break

                        case 2:
                            postfix = 'M'
                            break

                        case 3:
                            postfix = 'B'
                            break
                    }

                    label.label = label.label.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        + postfix
                } else {
                    label.label = label.label.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
                }

                yCounter++
            }
        }

        this.#base = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    }

    #calculateSizes() {
        const xValues = this.data.values.flatMap(s => s.values.map(p => p.x)),
            yValues = this.data.values.flatMap(s => s.values.map(p => p.y))

        if (this.data.xType === OPlotAxisTypes.date)
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

        let max

        if (stackingColumns.length > 0) {
            let values = stackingColumns.map(s => s.values.flatMap(v => +v.y))

            max = this.#y.max

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

        this.#yAxisStep = Math.abs(this.#y.min) + Math.abs(this.#y.max)

        if (10 <= this.#yAxisStep && this.#yAxisStep < 100)
            this.#yAxisStep = 2
        else if (100 <= this.#yAxisStep && this.#yAxisStep < 1000)
            this.#yAxisStep = 20
        else if (1000 <= this.#yAxisStep && this.#yAxisStep < 10000)
            this.#yAxisStep = 50
        else if (10000 <= this.#yAxisStep && this.#yAxisStep < 100000)
            this.#yAxisStep = 1000
        else if (100000 <= this.#yAxisStep && this.#yAxisStep < 1000000)
            this.#yAxisStep = 10000
        else if (1000000 <= this.#yAxisStep && this.#yAxisStep < 10000000)
            this.#yAxisStep = 50000
        else
            this.#yAxisStep = 1

        if (this.#yAxisStep !== 1) {
            max = yValues.length > 10
                ? (this.#y.max / 10 + this.#yAxisStep - (this.#y.max / 10) % this.#yAxisStep) * 10
                : Math.ceil(this.#y.max / this.#yAxisStep) * this.#yAxisStep

            this.#y.max = max > this.data.yMax ? this.data.yMax : max
        }

        this.#plot = {
            width: this.canvas.width - this.#paddings.left - this.#paddings.right,
            height: this.canvas.height - this.#paddings.top - this.#paddings.bottom,
        }
    }
}