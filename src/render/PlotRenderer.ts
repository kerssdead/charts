import PlotData from 'types/data/PlotData'
import Renderer from 'types/base/Renderer'
import * as Helper from 'Helper'
import DropdownItem from 'types/DropdownItem'
import PlotAxis from 'types/PlotAxis'
import Paddings from 'types/Paddings'
import Dropdown from 'Dropdown'
import HoverItem from 'types/HoverItem'
import PlotSeries from 'types/PlotSeries'
import Tooltip from 'Tooltip'
import Theme from 'Theme'
import Chart from 'Chart'
import TooltipValue from 'types/TooltipValue'
import Export from 'Export'
import Decomposition from 'Decomposition'
import Modal from 'Modal'
import TextResources from 'static/TextResources'
import Formatter from 'helpers/Formatter'
import Canvas from 'helpers/Canvas'
import { AnimationType, Icon, LineType, PlotAxisType, PlotType, RenderState } from 'static/Enums'
import * as Constants from 'static/constants/Index'
import TextStyles from 'helpers/TextStyles'
import Box from 'types/Box'

class PlotRenderer extends Renderer<PlotData> {
    #x: PlotAxis

    #y: PlotAxis

    paddings: Paddings

    #tooltipX: number

    #tooltipY: number

    #allValuesX: any[]

    #allValuesY: any[]

    plot: Box

    #hoverX: HoverItem | undefined


    base: PlotBase

    tooltipValues: TooltipValue[]

    constructor(chart: Chart) {
        super(chart)

        this.plot = new Box()
    }

    render() {
        // TODO: move after empty ? or remove ?
        super.render()

        this.empty()

        // TODO: if empty is rendered, then return

        this.base.render()

        this.series()

        this.animate()
        this.interact()

        this.tooltip2()
        this.dropdown2()

        this.state = RenderState.Idle

        this.nextFrame()
    }

    empty() { }

    series() {
        const ctx = Canvas.getContext(this.canvas),
            paddings = this.paddings,
            canvas = this.canvas

        // setting default styles

        // TextStyles.regular(ctx)
        ctx.lineJoin = 'round'

        //

        const seriesClass = this.data.values.map(s => new PlotSeries2(s))

        for (const series of seriesClass)
            series.render()

        //

        let tooltipLines = []

        const axisLineHoverColor = Theme.lineActive

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
                    this.animations.handle(
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
                    this.animations.handle(
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
                        x: Formatter.format(value.x, this.data.xType),
                        y: Formatter.format(value.y, PlotAxisType.Number, this.settings.valuePostfix)
                    }
                }

                x = paddings.left
                if (series.type != PlotType.Bar)
                    x += xIndex * this.#x.step
                if (series.type == PlotType.Line)
                    x -= this.#x.step / 2 - this.#x.step

                switch (series.type) {
                    case PlotType.Line:
                        y = paddings.top + this.plot.height - <number>value.y / this.#y.unit * this.#y.step
                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                        const pointDuration = 1500 / series.values.length * 1.2

                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init)) {
                            this.animations.handle(value.id,
                                AnimationType.Init,
                                {
                                    timer: new Date(Date.now()).addMilliseconds(pointDuration * index),
                                    duration: pointDuration,
                                    continuous: true,
                                    body: transition => {
                                        if (index == 0)
                                            return

                                        // TODO: if use gradient then no need to calculate intermediate values ?

                                        x = paddings.left + (xIndex - .5) * this.#x.step
                                        y = paddings.top + this.plot.height - <number>value.y / this.#y.unit * this.#y.step
                                            - Math.abs(this.#y.min / this.#y.unit * this.#y.step)

                                        const next = series.values[index - 1]

                                        const prevValue = {
                                            x: paddings.left + (xIndex - .5) * this.#x.step,
                                            y: paddings.top + this.plot.height - <number>next.y / this.#y.unit * this.#y.step
                                               - Math.abs(this.#y.min / this.#y.unit * this.#y.step)
                                        },
                                            endPoint = {
                                                x: prevValue.x + (this.#x.step + (x - prevValue.x)) * transition,
                                                y: prevValue.y + (y - prevValue.y) * transition
                                            }

                                        if (prevValue.x != endPoint.x && prevValue.y != endPoint.y) {
                                            ctx.moveTo(prevValue.x, prevValue.y)
                                            ctx.lineTo(endPoint.x, endPoint.y)
                                        }
                                    }
                                })
                        } else {
                            ctx.lineTo(x, y)

                            if (this.#isOnX(x)) {
                                const mouse = this.getMousePosition(this.moveEvent)

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
                        yValue = canvas.height - paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                        ctx.moveTo(paddings.left, yValue)

                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init))
                            this.animations.handle(value.id,
                                AnimationType.Init,
                                {
                                    duration: 1500,
                                    continuous: true,
                                    body: transition => {
                                        ctx.lineTo(paddings.left + (canvas.width - paddings.left - paddings.right) * transition,
                                            canvas.height - paddings.bottom - <number>value.y / this.#y.unit * this.#y.step)
                                    }
                                })
                        else
                            ctx.lineTo(canvas.width - paddings.right, yValue)

                        break

                    case PlotType.Column:
                        yValue = <number>value.y > this.data.yMax ? this.data.yMax : <number>value.y

                        y = this.plot.height * yValue / this.#y.max
                        if (y < this.#y.minStep)
                            y = this.#y.minStep

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5) / columnsCount

                        ctx.beginPath()

                        if (this.state == RenderState.Init || this.animations.contains(value.id + columnsIndex, AnimationType.Init)) {
                            this.animations.handle(value.id + columnsIndex,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        yValue = <number>value.y > this.data.yMax ? this.data.yMax : <number>value.y

                                        x = paddings.left + xIndex * this.#x.step
                                        y = this.plot.height * yValue / this.#y.max * transition

                                        if (y < this.#y.minStep)
                                            y = this.#y.minStep * transition

                                        columnsIndex = this.data.values.filter(s => s.type == PlotType.Column)
                                                           .indexOf(series)

                                        ctx.roundRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                            canvas.height - paddings.bottom - y,
                                            columnWidth,
                                            y,
                                            [6, 6, 0, 0])
                                        ctx.fill()
                                    }
                                })
                        } else {
                            if (this.#isInArea(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                    canvas.height - paddings.bottom - y,
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
                            }

                            ctx.roundRect(x + columnsIndex * columnWidth + (this.#x.step - columnsCount * columnWidth) / 2,
                                canvas.height - paddings.bottom - y,
                                columnWidth,
                                y,
                                [6, 6, 0, 0])
                            ctx.fill()
                        }

                        break

                    case PlotType.Bar:
                        y = paddings.top + yIndex * this.#y.step + this.#y.step / 2
                            + (100 - series.width) * this.#y.step / 100 / 2

                        const seriesHeight = (series.width * this.#y.step / 100) / barsCount

                        if (this.state == RenderState.Init || this.animations.contains(value.id + barsIndex, AnimationType.Init)) {
                            this.animations.handle(value.id + barsIndex,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        y = paddings.top + yIndex * this.#y.step + this.#y.step / 2
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

                                tooltipLines.push(new TooltipValue(`${ series.label }: ${ getTooltipValue().x }`, series.color))
                                this.#tooltipY = y - this.#y.step / 2
                            }

                            ctx.fillRect(x,
                                y - this.#y.step / 2 + barsIndex * seriesHeight,
                                <number>value.x / this.#x.unit * this.#x.step,
                                seriesHeight)
                        }

                        break

                    case PlotType.StackingColumn:
                        y = canvas.height - paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                        columnWidth = this.#x.step * (series.width ? series.width / 100 : .5)

                        if (this.state == RenderState.Init || this.animations.contains(value.id + index, AnimationType.Init)) {
                            this.animations.handle(value.id + index,
                                AnimationType.Init,
                                {
                                    duration: 800,
                                    continuous: true,
                                    body: transition => {
                                        columnsIndex = this.data.values.filter(s => s.type == PlotType.StackingColumn
                                                                                    && s.values.filter(v => this.data.xType == PlotAxisType.Date
                                                                                                            ? (v.x as Date).getTime() == (value.x as Date).getTime()
                                                                                                            : v.x == value.x)
                                                                                        .length > 0)
                                                           .indexOf(series)

                                        x = paddings.left + xIndex * this.#x.step
                                        y = canvas.height - paddings.bottom - <number>value.y / this.#y.unit * this.#y.step

                                        if (columnsIndex == 0)
                                            stackingAccumulator[xIndex] = 0

                                        let offset = stackingAccumulator[xIndex] != undefined
                                                     ? stackingAccumulator[xIndex]
                                                     : 0

                                        yValue = canvas.height - paddings.bottom + offset
                                        yHeight = (y - canvas.height + paddings.bottom) * transition

                                        if (yValue > paddings.top) {
                                            if (yValue + yHeight < paddings.top)
                                                yHeight -= yValue + yHeight - paddings.top

                                            ctx.fillRect(x + (this.#x.step - columnWidth) / 2,
                                                yValue,
                                                columnWidth,
                                                yHeight)
                                        }

                                        stackingAccumulator[xIndex] += (y - canvas.height + paddings.bottom) * transition
                                    }
                                })
                        } else {
                            if (columnsIndex == 0)
                                stackingAccumulator[xIndex] = 0

                            let offset = stackingAccumulator[xIndex] != undefined
                                         ? stackingAccumulator[xIndex]
                                         : 0

                            yValue = canvas.height - paddings.bottom + offset
                            yHeight = y - canvas.height + paddings.bottom

                            if (yValue > paddings.top) {
                                if (yValue + yHeight < paddings.top)
                                    yHeight -= yValue + yHeight - paddings.top

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
                                }

                                ctx.fillRect(x + (this.#x.step - columnWidth) / 2,
                                    yValue,
                                    columnWidth,
                                    yHeight)
                            }

                            stackingAccumulator[xIndex] += (y - canvas.height + paddings.bottom)
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
                        ctx.moveTo(paddings.left, this.#hoverX.y)
                        ctx.lineTo(canvas.width - paddings.right, this.#hoverX.y)
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
                        paddings.left + (canvas.width - paddings.left - paddings.right) / 2,
                        canvas.height - paddings.bottom - <number>series.values[0].y / this.#y.unit * this.#y.step + 16)

                    break

                case PlotType.Column:
                case PlotType.StackingColumn:
                case PlotType.Bar:
                    if (this.#hoverX)
                        this.highlight(this.#hoverX.series)

                    columnsIndex++
                    barsIndex++

                    break
            }
        }

        this.tooltipValues = tooltipLines
    }

    animate() { }

    interact() { }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.size()
    }

    // TODO: better name ?
    prepareSettings() {
        super.prepareSettings()

        // v | map data
        // v | flip bar series
        // v | normalize data

        let values = []

        for (let series of this.data.values) {
            series = new PlotSeries(series)

            if (series.type == PlotType.Bar)
                series.inverse()

            series.normalize(this.data.xType)

            values.push(series)
        }

        this.data.values = values

        // v | set paddings

        this.setPaddings()

        // init tooltip

        this.tooltip = new Tooltip(this.canvas, this.settings)

        this.base = new PlotBase(this, this.data)
    }

    size() {
        this.plot.set(
            this.canvas.width - this.paddings.left - this.paddings.right,
            this.canvas.height - this.paddings.top - this.paddings.bottom
        )

        // flat values

        let xValues = this.data.values.flatMap(s => s.values.map(p => p.x)),
            yValues = this.data.values.flatMap(s => s.values.map(p => p.y as number))

        const isDate = this.data.xType == PlotAxisType.Date,
            isText = this.data.xType == PlotAxisType.Text,
            isNumber = !isDate && !isText

        // adding missed dates to x-axis

        const byAsc = (a: string | number | Date, b: string | number | Date) => b > a ? -1 : 1

        if (isDate) {
            let tempDate = new Date(Math.min(...(<number[]>xValues)))

            while (tempDate.getTime() < Math.max(...(<number[]>xValues))) {
                if (!xValues.includes(tempDate.getTime()))
                    xValues.push(new Date(tempDate.getTime()))

                tempDate = tempDate.addDays(1)
            }

            xValues.sort(byAsc)
        }

        // add rounded to last

        if (this.base.isVertical)
            xValues = Helper.getRoundedValues(xValues as number[])
        else
            yValues = Helper.getRoundedValues(yValues)

        // setting all values

        yValues.sort(byAsc)

        this.#allValuesX = [...new Set(xValues.filter(x => x != undefined).map(x => isDate ? x.toString() : x))]
        this.#allValuesY = [...new Set(yValues.filter(y => y != undefined))]

        //

        const plot = this.plot

        // setting variables for x-axis

        const xUnit = (xValues[1] as number) - (xValues[0] as number)

        this.#x = {
            min: Math.min(...(<number[]>xValues)),
            max: Math.max(...(<number[]>xValues)),
            unit: xUnit,
            step: plot.width / this.#allValuesX.length,
            minStep: 0
        }

        // setting variables for y-axis

        const yMin = Math.min(Math.min(...yValues), 0)
        const yUnit = yValues[1] - yValues[0]

        const yStepOffset = this.base.isVertical ? 0 : 1

        this.#y = {
            min: yMin,
            max: this.data.yMax ?? Math.max(...yValues),
            unit: yUnit,
            step: plot.height / (this.#allValuesY.length - yStepOffset),
            minStep: 0
        }

        // init settings for stacking columns

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

        // getting max width for y label and add offset to left padding
        // TODO: remove ? rework ?

        // const paddings = this.paddings,
        //     canvas = this.canvas
        //
        // const yMaxWidth = Helper.stringWidth(Formatter.number(this.#y.max))
        // if (yMaxWidth > this.paddings.left - 40 && !this.data.simple) {
        //     this.paddings.left += yMaxWidth - this.paddings.left + 40
        //     this.#x.step = (this.canvas.width - this.paddings.left - this.paddings.right) / this.#allValuesX.length
        // }
    }

    initDropdown() {
        super.initDropdown()

        if (this.data.simple) {
            this.dropdown = undefined

            return
        }

        this.dropdown = new Dropdown(this.canvas,
            {
                x: -10,
                y: 10,
                icon: Icon.ThreeLines,
                items: [
                    DropdownItem.button(
                        TextResources.exportPNG,
                        () => Export.asPng(this.canvas, this.settings.title)
                    ),
                    DropdownItem.button(
                        TextResources.exportCSV,
                        () => Export.asCsv(
                            Decomposition.toTable(PlotData.getRows(this.data)),
                            this.settings.title
                        )
                    ),
                    DropdownItem.divider(),
                    DropdownItem.button(
                        TextResources.decomposeToTable,
                        () => new Modal(
                            Decomposition.toTable(PlotData.getRows(this.data)),
                            undefined,
                            this.settings.title ?? TextResources.dataAsTable)
                            .open()
                    )
                ]
            })
    }

    tooltip2() {
        if (this.data.simple)
            return

        if (this.tooltipValues.length > 0) {
            const getValue = (labels: Map<number, string>, pos: number) => {
                let curr = 0,
                    index = 0

                let keys = [...labels.keys()]

                while (curr < pos)
                    curr = keys[index++]

                return labels.get(curr)
            }

            this.tooltipValues.unshift(
                new TooltipValue(
                    this.base.isVertical
                    ? getValue(this.base.labelsY, this.#tooltipY)
                    : getValue(this.base.labelsX, this.#tooltipX)
                )
            )
        }

        this.tooltip.render(
            this.tooltipValues.length > 1 && !this.dropdown?.isActive,
            this.moveEvent,
            this.tooltipValues,
            this.#hoverX
            ? this.#hoverX.series!.values[this.#hoverX.index]
            : undefined
        )
    }

    dropdown2() {
        super.renderDropdown()

        if (this.menuEvent && !this.#hoverX)
            this.menuEvent = undefined

        if (this.#hoverX == undefined)
            this.highlight()

        // reset hover if context menu is open

        if (this.#hoverX
            && (this.renderContextMenu(this.#hoverX.data)
                || !this.menuEvent))
            this.#hoverX = undefined
    }

    nextFrame() {
        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))
    }

    private setPaddings() {
        if (!this.data.simple)
            this.paddings = {
                top: 30,
                right: 40,
                bottom: 50,
                left: 80
            }
        else
            this.paddings = {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }

        if (this.settings.title)
            this.paddings.top += Constants.Values.titleOffset
    }



    #isInArea(x: number, y: number, w: number, h: number) {
        if (!this.moveEvent)
            return false

        const mouse = this.getMousePosition(this.moveEvent)

        return !(this.dropdown?.isActive ?? false)
               && mouse.x >= x && mouse.x <= x + w
               && mouse.y >= y && mouse.y <= y + h
    }

    // TODO: combine with this.isInArea()
    #isOnX(x: number) {
        if (!this.moveEvent)
            return false

        const mouse = this.getMousePosition(this.moveEvent)

        return !(this.dropdown?.isActive ?? false)
               && x - this.#x.step / 2 <= mouse.x && mouse.x < x + this.#x.step / 2
               && this.paddings.top <= mouse.y && mouse.y <= this.canvas.height - this.paddings.bottom
               && this.paddings.left < mouse.x
    }
}

class PlotSeries2 extends PlotSeries {
    constructor(obj: object) {
        super(obj)

        Object.assign(this, obj)
    }

    render() {
        this.area()
        this.label2()

        this.animate()
        this.interact()
    }

    animate() { }

    interact() { }

    area() { }

    label2() { }

    // isInArea(x: number, y: number, w: number, h: number) {
    //     // if (!this.moveEvent)
    //     //     return false
    //     //
    //     // const mouse = this.getMousePosition(this.moveEvent)
    //     //
    //     // return !(this.dropdown?.isActive ?? false)
    //     //        && mouse.x >= x && mouse.x <= x + w
    //     //        && mouse.y >= y && mouse.y <= y + h
    // }
    //
    // // TODO: combine with this.isInArea()
    // isOnX(x: number) {
    //     // if (!this.moveEvent)
    //     //     return false
    //     //
    //     // const mouse = this.getMousePosition(this.moveEvent)
    //     //
    //     // return !(this.dropdown?.isActive ?? false)
    //     //        && x - this.#x.step / 2 <= mouse.x && mouse.x < x + this.#x.step / 2
    //     //        && this.#paddings.top <= mouse.y && mouse.y <= this.canvas.height - this.#paddings.bottom
    //     //        && this.#paddings.left < mouse.x
    // }

    canRenderLabel() { }
}

class PlotBase {
    renderer: PlotRenderer

    data: PlotData

    isVertical: boolean

    labelsX: Map<number, string>

    labelsY: Map<number, string>

    // TODO: uncomment
    // labels: PlotBaseLabels

    constructor(renderer: PlotRenderer, data: PlotData) {
        this.renderer = renderer
        this.data = data

        this.isVertical = data.values.filter(s => s.type == PlotType.Bar).length > 0
    }

    render() {
        this.clear()

        if (this.data.simple)
            return

        if (!this.labelsX || !this.labelsY)
            this.calculateLabels()

        this.lines()
        this.backlines()
        this.labels()
        this.titles()

        this.renderer.renderTitle()
    }

    clear() {
        const canvas = this.renderer.canvas,
            ctx = Canvas.getContext(canvas)

        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    lines() {
        const canvas = this.renderer.canvas,
            paddings = this.renderer.paddings

        const ctx = Canvas.getContext(canvas)

        // clear area around this.#plot

        ctx.fillStyle = Theme.canvasBackground

        ctx.fillRect(0, 0, paddings.left, canvas.height)
        ctx.fillRect(0, 0, canvas.width, paddings.top)
        ctx.fillRect(canvas.width - paddings.right, 0, canvas.width, canvas.height)
        ctx.fillRect(0, canvas.height - paddings.bottom, canvas.width, canvas.height)

        ctx.setLineDash([])

        // set baselines

        ctx.beginPath()

        ctx.strokeStyle = Theme.line
        ctx.lineWidth = 1

        ctx.moveTo(paddings.left, canvas.height - paddings.bottom)

        if (this.isVertical)
            ctx.lineTo(paddings.left, paddings.top)
        else
            ctx.lineTo(canvas.width - paddings.right, canvas.height - paddings.bottom)

        ctx.stroke()
    }

    backlines() {
        const canvas = this.renderer.canvas,
            paddings = this.renderer.paddings

        const ctx = Canvas.getContext(canvas)

        ctx.lineWidth = 1
        ctx.strokeStyle = Theme.lineAxis
        ctx.setLineDash([6, 6])

        if (this.isVertical) {
            for (const l of this.labelsX) {
                const x = l[0]

                if (x == paddings.left)
                    continue

                ctx.beginPath()

                ctx.moveTo(x, paddings.top)
                ctx.lineTo(x, canvas.height - paddings.bottom)

                ctx.stroke()
            }
        }

        if (!this.isVertical) {
            let index = 0

            for (const l of this.labelsY) {
                const y = l[0]

                if (index++ == this.labelsY.size - 1)
                    continue

                ctx.beginPath()

                ctx.moveTo(paddings.left, y)
                ctx.lineTo(canvas.width - paddings.right, y)

                ctx.stroke()
            }
        }
    }

    labels() {
        const canvas = this.renderer.canvas,
            paddings = this.renderer.paddings

        const ctx = Canvas.getContext(canvas)

        TextStyles.regular(ctx)

        for (const point of this.labelsX) {
            const x = point[0],
                y = canvas.height - paddings.bottom + 20

            if (Canvas.isCanRender(ctx, x, y, point[1], 20))
                ctx.fillText(point[1], x, y)
        }

        for (const point of this.labelsY) {
            const x = paddings.left - 10,
                y = point[0]

            ctx.textAlign = 'end'

            if (Canvas.isCanRender(ctx, x, y, point[1], 20, true))
                ctx.fillText(point[1], x, y)
        }
    }

    titles() {
        /*
         * render x-axis title
         * render y-axis title
         */

        const canvas = this.renderer.canvas,
            paddings = this.renderer.paddings

        const ctx = Canvas.getContext(canvas)

        if (this.data.xTitle || this.data.yTitle) {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillStyle = Theme.text

            if (this.data.xTitle)
                ctx.fillText(this.data.xTitle,
                    paddings.left + (canvas.width - paddings.left - paddings.right) / 2,
                    canvas.height - 4)

            if (this.data.yTitle) {
                ctx.rotate(-Math.PI / 2)

                ctx.textBaseline = 'top'

                ctx.fillText(this.data.yTitle,
                    -(paddings.top + (canvas.height - paddings.top - paddings.bottom) / 2),
                    8)

                ctx.resetTransform()
            }
        }
    }

    calculateLabels() {
        const paddings = this.renderer.paddings

        this.labelsX = new Map<number, string>()
        this.labelsY = new Map<number, string>()

        let uniqueX = [...new Set(this.data.values.flatMap(s => s.values).flatMap(v => v.x))],
            uniqueY = [...new Set(this.data.values.flatMap(s => s.values).flatMap(v => v.y as number))]

        // getting rounded values

        if (this.isVertical)
            uniqueX = Helper.getRoundedValues(uniqueX as number[])
        else
            uniqueY = Helper.getRoundedValues(uniqueY).reverse()

        //

        const stepXOffset = this.isVertical ? 1 : 0,
            stepYOffset = this.isVertical ? 0 : 1
        const xOffset = this.isVertical ? 0 : .5,
            yOffset = this.isVertical ? .5 : 0

        const stepX = this.renderer.plot.width / (uniqueX.length - stepXOffset),
            stepY = this.renderer.plot.height / (uniqueY.length - stepYOffset)

        for (let i = 0; i < uniqueX.length; i++)
            this.labelsX.set(
                Math.round(paddings.left + stepX * (i + xOffset)),
                Formatter.format(
                    uniqueX[i],
                    this.renderer.data.xType
                )
            )

        for (let i = 0; i < uniqueY.length; i++)
            this.labelsY.set(
                paddings.top + stepY * (i + yOffset),
                Formatter.format(
                    uniqueY[i],
                    PlotAxisType.Number
                )
            )

        this.fixLeftPadding()
    }

    private fixLeftPadding() {
        const max = Math.max(...[...this.labelsY.values()].map(v => Helper.stringWidth(v)))

        if (this.renderer.paddings.left <= 80 && max > 54) {
            this.renderer.paddings.left += max - 44

            this.calculateLabels()
        }
    }
}

class PlotBaseLabels {
    constructor() {

    }

    calculate() {

    }

    render() {

    }

    private round() {

    }
}

export default PlotRenderer