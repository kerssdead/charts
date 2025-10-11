import { PlotData } from '../types/data/PlotData'
import { Renderer } from '../types/base/Renderer'
import { Helper } from '../Helper'
import { DropdownItem } from '../types/DropdownItem'
import { PlotAxis } from '../types/PlotAxis'
import { Paddings } from '../types/Paddings'
import { Dropdown } from '../Dropdown'
import { HoverItem } from '../types/HoverItem'
import { PlotSeries } from '../types/PlotSeries'
import { Tooltip } from '../Tooltip'
import { Theme } from '../Theme'
import { Chart } from '../Chart'
import { TextStyles } from '../helpers/TextStyles'
import { TooltipValue } from '../types/TooltipValue'
import { Export } from '../Export'
import { Decomposition } from '../Decomposition'
import { Modal } from '../Modal'
import { TextResources } from '../static/TextResources'
import { Formatter } from '../helpers/Formatter'
import { Canvas } from '../helpers/Canvas'
import { AnimationType, Icon, LineType, PlotAxisType, PlotType, RenderState } from '../static/Enums'
import * as Constants from '../static/constants/Index'

export class PlotRenderer extends Renderer<PlotData> {
    #x: PlotAxis

    #y: PlotAxis

    #paddings: Paddings

    #tooltipX: number

    #tooltipY: number

    #labelsX: Map<number, string>

    #labelsY: Map<number, string>

    #allValuesX: any[]

    #allValuesY: any[]

    #base: ImageBitmap | undefined

    #backLines: ImageData | undefined

    #yAxisStep: number

    #plot: DOMRect

    #hoverX: HoverItem | undefined

    constructor(chart: Chart) {
        super(chart)

        this.data.values = this.data.values.map(v => new PlotSeries(v))

        if (this.data.values.filter(v => v.type == PlotType.Bar).length > 0) {
            for (let series of this.data.values) {
                for (let item of series.values) {
                    const x = item.x
                    item['x'] = item.y
                    item['y'] = x
                }

                series.values.sort((a, b) => b.x > a.x ? 1 : -1)
            }
        }

        this.#paddings = {
            top: 30,
            right: 40,
            bottom: 50,
            left: 80
        }

        if (this.settings.title)
            this.#paddings.top += Constants.Values.titleOffset

        this.tooltip = new Tooltip(this.canvas, this.settings)

        this.#labelsX = new Map()
        this.#labelsY = new Map()
    }

    render() {
        super.render()

        let tooltipLines = [
            new TooltipValue(this.#labelsX.get(Math.round(this.#tooltipX))
                             ?? this.#labelsY.get(Math.round(this.#tooltipY)))
        ]

        const ctx = Canvas.getContext(this.canvas)

        TextStyles.regular(ctx)
        ctx.lineJoin = 'round'

        const axisLineHoverColor = Theme.lineActive

        this.#renderBackLines()
        this.#renderBase(true)

        let x = 0,
            y = 0,
            yValue = 0,
            yHeight = 0,
            columnWidth = 0

        const seriesToRender = this.data.values.filter(s => !s.disabled)

        let columnsIndex = 0,
            columnsCount = seriesToRender.filter(s => s.type == PlotType.Column).length

        let barsIndex = 0,
            barsCount = seriesToRender.filter(s => s.type == PlotType.Bar).length

        let stackingAccumulator = []
        for (let i = 0; i < this.#allValuesY.length; i++)
            stackingAccumulator.push(0)

        for (const series of seriesToRender) {
            ctx.beginPath()

            ctx.strokeStyle = series.color
            ctx.fillStyle = series.color
            ctx.lineWidth = series.width
            ctx.lineCap = 'round'

            const anyHighlight = this.highlightItems.length != 0

            if (!this.animations.contains(series.id, AnimationType.Init)) {
                const changeColor = (transition: number, event: AnimationType) => {
                    this.animations.reload(series.id, event)

                    if (transition == 0)
                        return

                    let opacity = Math.round(255 - 127 * transition).toString(16)
                    if (opacity.length < 2)
                        opacity = 0 + opacity

                    ctx.fillStyle = series.color + opacity
                    ctx.strokeStyle = series.color + opacity
                }

                if (anyHighlight && !this.highlightItems.includes(series.id)) {
                    this.animations.add(
                        series.id,
                        AnimationType.AnotherItemOver,
                        {
                            duration: Constants.Animations.circular,
                            body: transition => {
                                changeColor(transition, AnimationType.AnotherItemLeave)
                            }
                        }
                    )
                } else if (!anyHighlight) {
                    this.animations.add(
                        series.id,
                        AnimationType.AnotherItemLeave,
                        {
                            timer: Constants.Dates.minDate,
                            duration: Constants.Animations.circular,
                            backward: true,
                            body: transition => {
                                changeColor(transition, AnimationType.AnotherItemOver)
                            }
                        }
                    )
                }
            }

            switch (series.lineType) {
                case LineType.Dash:
                    ctx.setLineDash([series.width * 3, series.width * 2])

                    break

                case LineType.Dotted:
                    ctx.setLineDash([series.width, series.width])

                    break

                case LineType.Solid:
                default:
                    break
            }

            for (const value of series.values) {
                let index = series.values.indexOf(value),
                    xIndex = this.#allValuesX.indexOf(this.data.xType == PlotAxisType.Date ? value.x?.toString() : value.x),
                    yIndex = this.#allValuesY.indexOf(value.y)

                const getTooltipValue = () => {
                    return {
                        x: value.x
                           ? this.data.xType == PlotAxisType.Date
                             ? this.#allValuesX[xIndex]
                             : Formatter.number(this.#allValuesX[xIndex])
                           : '0',
                        y: value.y
                           ? Formatter.number(this.#allValuesY[yIndex])
                           : '0'
                    }
                }

                x = this.#paddings.left
                if (series.type != PlotType.Bar)
                    x += xIndex * this.#x.step
                if (series.type == PlotType.Line)
                    x -= this.#x.step / 2 - this.#x.step

                switch (series.type) {
                    case PlotType.Line:
                        y = this.#paddings.top + this.#plot.height - <number>value.y / this.#y.unit * this.#y.step
                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                        const pointDuration = 1500 / series.values.length * 1.2

                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init)) {
                            this.animations.add(value.id,
                                AnimationType.Init,
                                {
                                    timer: new Date(Date.now()).addMilliseconds(pointDuration * (index - 1)),
                                    duration: pointDuration,
                                    continuous: true,
                                    body: transition => {
                                        if (index == 0)
                                            return

                                        x = this.#paddings.left + xIndex * this.#x.step - this.#x.step / 2
                                        y = this.#paddings.top + this.#plot.height - <number>value.y / this.#y.unit * this.#y.step
                                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                                        const next = series.values[index - 1]

                                        let prevValue = {
                                            x: this.#paddings.left + xIndex * this.#x.step - this.#x.step / 2,
                                            y: this.#paddings.top + this.#plot.height - <number>next.y / this.#y.unit * this.#y.step
                                               - Math.abs(this.#y.min / this.#y.unit * this.#y.step)
                                        }

                                        const endPointX = prevValue.x + (this.#x.step + (x - prevValue.x)) * transition,
                                            endPointY = prevValue.y + (y - prevValue.y) * transition

                                        if (prevValue.x != endPointX && prevValue.y != endPointY) {
                                            ctx.moveTo(prevValue.x, prevValue.y)
                                            ctx.lineTo(endPointX, endPointY)
                                        }
                                    }
                                })
                        } else {
                            ctx.lineTo(x, y)

                            if (this.#isOnX(x)) {
                                const mouse = this.getMousePosition(this.onMouseMoveEvent)

                                if (Math.abs(mouse.y - y) < 5) {
                                    this.#hoverX = {
                                        x: x,
                                        y: y,
                                        index: index,
                                        data: value.data,
                                        series: series
                                    }

                                    tooltipLines.push(new TooltipValue(`${ series.label }: ${ getTooltipValue().y }`, series.color))
                                    this.#tooltipX = x - this.#x.step / 2
                                }
                            }
                        }

                        break

                    case PlotType.AttentionLine:
                        yValue = this.canvas.height - this.#paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                        ctx.moveTo(this.#paddings.left, yValue)

                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init))
                            this.animations.add(value.id,
                                AnimationType.Init,
                                {
                                    duration: 1500,
                                    continuous: true,
                                    body: transition => {
                                        ctx.lineTo(this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) * transition,
                                            this.canvas.height - this.#paddings.bottom - <number>value.y / this.#y.unit * this.#y.step)
                                    }
                                })
                        else
                            ctx.lineTo(this.canvas.width - this.#paddings.right, yValue)

                        break

                    case PlotType.Column:
                        yValue = <number>value.y > this.data.yMax ? this.data.yMax : <number>value.y

                        y = this.#plot.height * yValue / this.#y.max
                        if (y < this.#y.minStep)
                            y = this.#y.minStep

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5) / columnsCount

                        ctx.beginPath()

                        if (this.state == RenderState.Init || this.animations.contains(value.id + columnsIndex, AnimationType.Init)) {
                            this.animations.add(value.id + columnsIndex,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        yValue = <number>value.y > this.data.yMax ? this.data.yMax : <number>value.y

                                        x = this.#paddings.left + xIndex * this.#x.step
                                        y = this.#plot.height * yValue / this.#y.max * transition

                                        if (y < this.#y.minStep)
                                            y = this.#y.minStep * transition

                                        columnsIndex = this.data.values.filter(s => s.type == PlotType.Column)
                                                           .indexOf(series)

                                        ctx.roundRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                            this.canvas.height - this.#paddings.bottom - y,
                                            columnWidth,
                                            y,
                                            [6, 6, 0, 0])
                                        ctx.fill()
                                    }
                                })
                        } else {
                            if (!anyHighlight) {
                                if (this.#isInArea(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                        this.canvas.height - this.#paddings.bottom - y,
                                        columnWidth,
                                        y)
                                    && (this.contextMenu?.isActive == undefined
                                        || this.contextMenu?.isActive == false)) {
                                    this.#hoverX = {
                                        x: x,
                                        y: y,
                                        index: index,
                                        data: value.data,
                                        series: series
                                    }

                                    tooltipLines.push(new TooltipValue(`${ series.label }: ${ getTooltipValue().y }`, series.color))
                                    this.#tooltipX = x

                                    ctx.fillStyle += '88'
                                } else {
                                    ctx.fillStyle = series.color
                                }
                            }

                            ctx.roundRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                this.canvas.height - this.#paddings.bottom - y,
                                columnWidth,
                                y,
                                [6, 6, 0, 0])
                            ctx.fill()
                        }

                        break

                    case PlotType.Bar:
                        y = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2
                            + (100 - series.width) * this.#y.step / 100 / 2

                        const seriesHeight = (series.width * this.#y.step / 100) / barsCount

                        if (this.state == RenderState.Init || this.animations.contains(value.id + barsIndex, AnimationType.Init)) {
                            this.animations.add(value.id + barsIndex,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        y = this.#paddings.top + yIndex * this.#y.step + this.#y.step / 2
                                            + (100 - series.width) * this.#y.step / 100 / 2

                                        barsIndex = this.data.values.filter(s => s.type == PlotType.Bar)
                                                        .indexOf(series)

                                        ctx.fillRect(x,
                                            y - this.#y.step / 2 + barsIndex * seriesHeight,
                                            <number>value.x / this.#x.unit * this.#x.step * transition,
                                            seriesHeight)
                                    }
                                })
                        } else {
                            if (!anyHighlight) {
                                if (this.#isInArea(x,
                                    y - this.#y.step / 2 + barsIndex * seriesHeight,
                                    <number>value.x / this.#x.unit * this.#x.step,
                                    seriesHeight)) {
                                    this.#hoverX = {
                                        x: x,
                                        y: y,
                                        index: index,
                                        data: value.data,
                                        series: series
                                    }

                                    ctx.fillStyle += '88'

                                    tooltipLines.push(new TooltipValue(`${ series.label }: ${ getTooltipValue().x }`, series.color))
                                    this.#tooltipY = y - this.#y.step / 2
                                } else {
                                    ctx.fillStyle = series.color
                                }
                            }

                            ctx.fillRect(x,
                                y - this.#y.step / 2 + barsIndex * seriesHeight,
                                <number>value.x / this.#x.unit * this.#x.step,
                                seriesHeight)
                        }

                        break

                    case PlotType.StackingColumn:
                        y = this.canvas.height - this.#paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5)

                        if (this.state == RenderState.Init || this.animations.contains(value.id + index, AnimationType.Init)) {
                            this.animations.add(value.id + index,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        columnsIndex = this.data.values.filter(s => s.type == PlotType.StackingColumn && s.values.filter(v => v.x == value.x).length > 0)
                                                           .indexOf(series)

                                        x = this.#paddings.left + xIndex * this.#x.step
                                        y = this.canvas.height - this.#paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                                        if (columnsIndex == 0)
                                            stackingAccumulator[xIndex] = 0

                                        let offset = stackingAccumulator[xIndex] != undefined
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
                            if (columnsIndex == 0)
                                stackingAccumulator[xIndex] = 0

                            let offset = stackingAccumulator[xIndex] != undefined
                                         ? stackingAccumulator[xIndex]
                                         : 0

                            yValue = this.canvas.height - this.#paddings.bottom + offset
                            yHeight = y - this.canvas.height + this.#paddings.bottom

                            if (yValue > this.#paddings.top) {
                                if (yValue + yHeight < this.#paddings.top)
                                    yHeight -= yValue + yHeight - this.#paddings.top

                                if (!anyHighlight) {
                                    if (this.#isInArea(x + (this.#x.step - columnWidth) / 2,
                                        yValue + yHeight,
                                        columnWidth,
                                        Math.abs(yHeight))) {
                                        this.#hoverX = {
                                            x: x,
                                            y: y,
                                            index: xIndex,
                                            data: value.data,
                                            series: series
                                        }

                                        tooltipLines.push(new TooltipValue(`${ series.label }: ${ getTooltipValue().y }`, series.color))
                                        this.#tooltipX = x

                                        ctx.fillStyle += '88'
                                    } else {
                                        ctx.fillStyle = series.color
                                    }
                                }

                                ctx.fillRect(x + (this.#x.step - columnWidth) / 2,
                                    yValue,
                                    columnWidth,
                                    yHeight)
                            }

                            stackingAccumulator[xIndex] += (y - this.canvas.height + this.#paddings.bottom)
                        }

                        break
                }
            }

            ctx.setLineDash([])

            switch (series.type) {
                case PlotType.Line:
                    ctx.stroke()

                    if (this.#hoverX && this.#hoverX.series == series) {
                        ctx.beginPath()
                        ctx.lineWidth = 1
                        ctx.strokeStyle = axisLineHoverColor
                        ctx.moveTo(this.#paddings.left, this.#hoverX.y)
                        ctx.lineTo(this.canvas.width - this.#paddings.right, this.#hoverX.y)
                        ctx.stroke()

                        let radius = Math.round(series.width * 1.1)
                        if (radius < 5)
                            radius = 5

                        ctx.beginPath()
                        ctx.arc(this.#hoverX.x, this.#hoverX.y, radius, 0, 2 * Math.PI)
                        ctx.fill()
                        ctx.lineWidth = Math.ceil(radius / 2)
                        ctx.strokeStyle = Helper.adjustColor(series.color, 50)
                        ctx.stroke()
                    }

                    break

                case PlotType.AttentionLine:
                    ctx.stroke()

                    TextStyles.regular(ctx)
                    ctx.fillText(series.label,
                        this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) / 2,
                        this.canvas.height - this.#paddings.bottom - <number>series.values[0].y / this.#y.unit * this.#y.step + 16)

                    break

                case PlotType.Column:
                case PlotType.StackingColumn:
                    if (this.#hoverX) {
                        let offset = stackingAccumulator[this.#hoverX.index] != undefined
                                     ? stackingAccumulator[this.#hoverX.index]
                                     : 0

                        if (this.canvas.height - this.#paddings.bottom + offset > this.#paddings.top) {
                            ctx.beginPath()
                            ctx.lineWidth = 1
                            ctx.strokeStyle = axisLineHoverColor
                            ctx.moveTo(this.#tooltipX + this.#x.step / 2,
                                this.#paddings.top)
                            ctx.lineTo(this.#tooltipX + this.#x.step / 2,
                                this.canvas.height - this.#paddings.bottom + offset)
                            ctx.stroke()
                        }
                    }

                    columnsIndex++

                    break

                case PlotType.Bar:
                    if (this.#hoverX) {
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

        this.#renderBase()

        this.renderTitle()

        this.tooltip.render(tooltipLines.length > 1 && !this.dropdown?.isActive,
            this.onMouseMoveEvent,
            tooltipLines,
            this.#hoverX
            ? this.#hoverX.series!.values[this.#hoverX.index]
            : undefined)

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))

        this.state = RenderState.Idle

        super.renderDropdown()

        if (this.onContextMenuEvent && !this.#hoverX)
            this.onContextMenuEvent = undefined

        if (this.#hoverX
            && (this.renderContextMenu(this.#hoverX.data)
                || !this.onContextMenuEvent))
            this.#hoverX = undefined
    }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.#base = undefined

        this.#calculateSizes()
    }

    #isOnX(x: number): boolean {
        if (!this.onMouseMoveEvent)
            return false

        const mouse = this.getMousePosition(this.onMouseMoveEvent)

        return !(this.dropdown?.isActive ?? false)
               && x - this.#x.step / 2 <= mouse.x && mouse.x < x + this.#x.step / 2
               && this.#paddings.top <= mouse.y && mouse.y <= this.canvas.height - this.#paddings.bottom
               && this.#paddings.left < mouse.x
    }

    #isInArea(x: number, y: number, w: number, h: number): boolean {
        if (!this.onMouseMoveEvent)
            return false

        const mouse = this.getMousePosition(this.onMouseMoveEvent)

        return !(this.dropdown?.isActive ?? false)
               && mouse.x >= x && mouse.x <= x + w
               && mouse.y >= y && mouse.y <= y + h
    }

    #renderBase(skip: boolean = false) {
        if (this.#base && skip)
            return

        if (this.data.simple)
            return

        const ctx = Canvas.getContext(this.canvas)

        if (skip)
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.#base) {
            ctx.drawImage(this.#base, 0, 0)
            return
        }

        if (!skip)
            return

        const axisLabelOffset = 12

        ctx.fillStyle = Theme.canvasBackground

        ctx.fillRect(0, 0, this.#paddings.left, this.canvas.height)
        ctx.fillRect(0, 0, this.canvas.width, this.#paddings.top)
        ctx.fillRect(this.canvas.width - this.#paddings.right, 0, this.canvas.width, this.canvas.height)
        ctx.fillRect(0, this.canvas.height - this.#paddings.bottom, this.canvas.width, this.canvas.height)

        const isContainsBar = this.data.values.filter(s => s.type == PlotType.Bar).length > 0

        if (this.data.xTitle || this.data.yTitle) {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillStyle = Theme.text

            if (this.data.xTitle)
                ctx.fillText(this.data.xTitle,
                    this.#paddings.left + (this.canvas.width - this.#paddings.left - this.#paddings.right) / 2,
                    this.canvas.height - 4)

            if (this.data.yTitle) {
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

        const step = this.#x.step,
            xYPos = this.canvas.height - this.#paddings.bottom

        let xCounter = 0,
            acc = this.#paddings.left + step / 2

        for (let i = 0; i < this.#allValuesX.length + 1; i++)
            this.#labelsX.trySet(
                Math.round(this.#paddings.left + i * this.#x.step),
                this.data.xType == PlotAxisType.Date
                ? Formatter.date(new Date(this.#allValuesX[i]))
                : isNaN(+this.#x.min) || !isFinite(+this.#x.min)
                  ? this.#allValuesX[i - 1]
                  : Formatter.number(
                        this.#x.min + i * (this.#x.max - this.#x.min) / (this.#x.count - 1)
                    )
            )

        const maxLabelWidth = Math.max(
            ...[...this.#labelsX.values()].map(label => Math.ceil(Helper.stringWidth(label)))
        ) + 10
        const maxCount = Math.floor(
            (this.canvas.width - this.#paddings.left - this.#paddings.right) / maxLabelWidth
        )
        const renderStep = Math.ceil(1 / (maxCount / this.#allValuesX.length))

        while (acc < this.canvas.width - this.#paddings.right) {
            if (xCounter % renderStep == 0) {
                ctx.fillStyle = Theme.text + 'b7'

                ctx.fillText(
                    this.#labelsX.get(Math.round(acc - this.#x.step / 2)) ?? '',
                    acc,
                    xYPos + axisLabelOffset / 2
                )
            }

            acc += step
            xCounter++
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
                    Formatter.number(this.#y.min + (i + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / this.#y.count))

            if (i >= yCounter * yStep) {
                const label = {
                    x: this.#paddings.left,
                    y: labelY,
                    label: this.#yAxisStep >= 1
                           ? Math.round((this.#y.min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / this.#y.count) / this.#yAxisStep) * this.#yAxisStep
                           : Math.round(this.#y.min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (this.#y.max - this.#y.min) / this.#y.count / this.#yAxisStep) * this.#yAxisStep
                }

                let postfix = ''

                if (this.data.shortLabels) {
                    const countOfTens = Math.floor(label.label.toString().length / 4)

                    if (countOfTens > 0) {
                        label.label /= Math.pow(1000, countOfTens)

                        postfix = [
                            TextResources.ThousandShort,
                            TextResources.MillionShort,
                            TextResources.BillionShort
                        ][countOfTens - 1]
                    }
                }

                ctx.fillText(Formatter.number(label.label) + postfix,
                    label.x - axisLabelOffset,
                    label.y + (isContainsBar ? this.#y.step / 2 : 0))

                yCounter++
            }
        }

        ctx.beginPath()

        ctx.strokeStyle = Theme.line
        ctx.lineWidth = 1

        const offset = .5,
            isBar = this.data.values.filter(v => v.type == PlotType.Bar).length > 0

        ctx.moveTo(this.#paddings.left - offset,
            this.canvas.height - this.#paddings.bottom + (isBar ? -offset : offset))

        if (isBar)
            ctx.lineTo(this.#paddings.left - offset, this.#paddings.top)
        else
            ctx.lineTo(this.canvas.width - this.#paddings.right, this.canvas.height - this.#paddings.bottom + offset)

        ctx.stroke()

        if (this.canvas.width > 0 && this.canvas.height > 0)
            createImageBitmap(ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
                .then(res => this.#base = res)
    }

    #renderBackLines() {
        if (this.data.simple)
            return

        const ctx = Canvas.getContext(this.canvas)

        if (this.#backLines) {
            ctx.putImageData(this.#backLines, 0, 0)
            return
        }

        ctx.fillStyle = Theme.canvasBackground
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const axisLineColor = Theme.lineAxis

        const isContainsBar = this.data.values.filter(s => s.type == PlotType.Bar).length > 0

        if (isContainsBar) {
            const step = this.#x.step,
                xYPos = this.canvas.height - this.#paddings.bottom

            let xCounter = 0,
                acc = this.#paddings.left + step / 2

            for (let i = 0; i < this.#allValuesX.length + 1; i++)
                this.#labelsX.trySet(
                    Math.round(this.#paddings.left + i * this.#x.step),
                    this.data.xType == PlotAxisType.Date
                    ? Formatter.date(new Date(this.#allValuesX[i - 1]))
                    : isNaN(+this.#x.min) || !isFinite(+this.#x.min)
                      ? this.#allValuesX[i - 1]
                      : Formatter.number(
                            this.#x.min + i * (this.#x.max - this.#x.min) / (this.#x.count - 1)
                        )
                )

            const maxLabelWidth = Math.max(
                ...[...this.#labelsX.values()].map(label => Math.ceil(Helper.stringWidth(label)))
            ) + 10
            const maxCount = Math.floor(
                (this.canvas.width - this.#paddings.left - this.#paddings.right) / maxLabelWidth
            )
            const renderStep = Math.ceil(1 / (maxCount / this.#allValuesX.length))

            while (acc < this.canvas.width - this.#paddings.right) {
                if (xCounter % renderStep == 0) {
                    ctx.beginPath()

                    ctx.moveTo(acc, xYPos)
                    ctx.lineTo(acc, this.#paddings.top)

                    ctx.lineWidth = 1
                    ctx.strokeStyle = axisLineColor
                    ctx.setLineDash([6, 6])
                    ctx.stroke()
                }

                acc += step
                xCounter++
            }
        }

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        const yCount = this.#y.count > 10 ? 10 : this.#y.count

        let yCounter = isContainsBar ? 1 : 0,
            yStep = this.#allValuesY.length / yCount

        for (let i = isContainsBar ? 1 : 0; i < this.#allValuesY.length + 1; i++) {
            const labelY = this.canvas.height - yCounter * yStep * this.#y.step - this.#paddings.bottom

            if (i >= yCounter * yStep) {
                const label = {
                    x: this.#paddings.left,
                    y: labelY
                }

                if (this.data.values.filter(s => s.type.isAnyEquals(PlotType.Column, PlotType.StackingColumn, PlotType.Line)).length > 0) {
                    ctx.beginPath()

                    ctx.moveTo(label.x, label.y)
                    ctx.lineTo(this.canvas.width - this.#paddings.right, label.y)

                    ctx.lineWidth = 1
                    ctx.strokeStyle = axisLineColor
                    ctx.setLineDash([6, 6])
                    ctx.stroke()
                }

                yCounter++
            }
        }

        if (this.canvas.width > 0 && this.canvas.height > 0)
            this.#backLines = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    }

    #calculateSizes() {
        let xValues = this.data.values.flatMap(s => s.values.map(p => p.x)),
            yValues = this.data.values.flatMap(s => s.values.map(p => p.y))

        const isDate = this.data.xType == PlotAxisType.Date

        if (isDate) {
            let tempDate = new Date(Math.min(...(<number[]>xValues)))

            while (tempDate.getTime() < Math.max(...(<number[]>xValues))) {
                if (!xValues.includes(tempDate.getTime()))
                    xValues.push(new Date(tempDate.getTime()))

                tempDate = tempDate.addDays(1)
            }

            xValues.sort((a, b) => a < b ? -1 : 1)
        }

        yValues.sort((a, b) => b > a ? -1 : 1)

        this.#allValuesX = [...new Set(xValues.filter(x => x != undefined).map(x => isDate ? x.toString() : x))]
        this.#allValuesY = [...new Set(yValues.filter(y => y != undefined))]

        this.#x = {
            min: Math.min(...(<number[]>xValues)),
            max: Math.max(...(<number[]>xValues)),
            unit: (Math.abs(Math.min(...(<number[]>xValues))) + Math.abs(Math.max(...(<number[]>xValues)))) / (this.#allValuesX.length - 1),
            step: (this.canvas.width - this.#paddings.left - this.#paddings.right) / this.#allValuesX.length,
            minStep: 0,
            count: this.#allValuesX.length
        }

        let yMin = Math.min(...(<number[]>yValues))
        if (yMin > 0)
            yMin = 0

        this.#y = {
            min: yMin,
            max: this.data.yMax ?? Math.max(...(<number[]>yValues)),
            unit: (Math.abs(yMin) + Math.abs(this.data.yMax ?? Math.max(...(<number[]>yValues)))) / (this.#allValuesY.length - 1),
            step: (this.canvas.height - this.#paddings.top - this.#paddings.bottom) / this.#allValuesY.length,
            minStep: 0,
            count: this.#allValuesY.length
        }

        let stackingColumns = this.data.values.filter(s => s.type == PlotType.StackingColumn)

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

        const yMaxWidth = Helper.stringWidth(Formatter.number(this.#y.max))
        if (yMaxWidth > this.#paddings.left - 40) {
            this.#paddings.left += yMaxWidth - this.#paddings.left + 40
            this.#x.step = (this.canvas.width - this.#paddings.left - this.#paddings.right) / this.#allValuesX.length
        }

        this.#yAxisStep = Math.abs(this.#y.min) + Math.abs(this.#y.max)

        if (.5 <= this.#yAxisStep && this.#yAxisStep < 1)
            this.#yAxisStep = .05
        else if (1 <= this.#yAxisStep && this.#yAxisStep < 10)
            this.#yAxisStep = .1
        else if (10 <= this.#yAxisStep && this.#yAxisStep < 100)
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

        if (this.#yAxisStep != 1) {
            max = yValues.length > 10
                  ? (this.#y.max / 10 + this.#yAxisStep - (this.#y.max / 10) % this.#yAxisStep) * 10
                  : Math.ceil(this.#y.max / this.#yAxisStep) * this.#yAxisStep

            this.#y.max = max > this.data.yMax ? this.data.yMax : max
            this.#y.unit = (Math.abs(this.#y.min) + Math.abs(this.#y.max)) / this.#allValuesY.length
        }

        this.#plot = {
            width: this.canvas.width - this.#paddings.left - this.#paddings.right,
            height: this.canvas.height - this.#paddings.top - this.#paddings.bottom
        } as DOMRect

        this.#x.minStep = this.#plot.width * 0.002
        this.#y.minStep = this.#plot.height * 0.002
    }

    prepareSettings() {
        super.prepareSettings()

        for (let item of this.data.values) {
            item.disabled = !item.values
            item.type ??= PlotType.Line

            for (let it of item.values) {
                it.id = Helper.guid()

                if (this.data.xType == PlotAxisType.Date) {
                    if (Helper.isISOString(it.x as string))
                        it.x = new Date(it.x)
                    else
                        console.warn(`${ it.x } is not a date in ISO format.`)
                }
            }
        }
    }

    initDropdown() {
        super.initDropdown()

        this.dropdown = new Dropdown(this.canvas,
            {
                x: -10,
                y: 10,
                icon: Icon.ThreeLines,
                items: [
                    {
                        text: TextResources.exportPNG,
                        action: () => {
                            Export.asPng(this.canvas, this.settings.title)
                        }
                    },
                    {
                        text: TextResources.exportCSV,
                        action: () => {
                            Export.asCsv(Decomposition.toTable(PlotData.getRows(this.data)), this.settings.title)
                        }
                    },
                    {
                        isDivider: true
                    } as DropdownItem,
                    {
                        text: TextResources.decomposeToTable,
                        action: () => {
                            new Modal(Decomposition.toTable(PlotData.getRows(this.data))).open()
                        }
                    }
                ]
            })
    }
}