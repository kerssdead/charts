class Legend {
    canvas: HTMLCanvasElement

    chart: Chart

    animations: Animations

    #canvasPosition: DOMRect

    #onMouseMoveEvent: MouseEvent

    #onClickEvent: MouseEvent | undefined

    #isInit: boolean = false

    #button: Button

    constructor(chart: Chart, context: HTMLElement) {
        this.chart = chart

        this.canvas = document.createElement('canvas')

        this.canvas.style.width = 'fit-content'

        switch (chart.settings.legendPlace) {
            case LegendPlace.Bottom:
                this.canvas.width = this.chart.settings.width
                this.canvas.height = Legend.getLegendHeight(this.chart.data.values, this.canvas.width)

                context.style.flexDirection = 'column'

                break

            case LegendPlace.Top:
                this.canvas.width = this.chart.settings.width
                this.canvas.height = Legend.getLegendHeight(this.chart.data.values, this.canvas.width)

                context.style.flexDirection = 'column-reverse'

                break

            case LegendPlace.Left:
                this.canvas.width = 500
                this.canvas.height = this.chart.settings.height

                context.style.flexDirection = 'row'

                break

            case LegendPlace.Right:
                this.canvas.width = 500
                this.canvas.height = this.chart.settings.height

                context.style.flexDirection = 'row-reverse'

                break
        }

        chart.node.append(this.canvas)

        this.animations = new Animations()

        this.#button = new Button(this.chart,
            this.canvas,
            {
                x: this.canvas.width - 110,
                y: 10,
                text: 'Reset',
                action: () => {
                    for (let value of this.chart.data.values)
                        value.reset()
                }
            })

        this.#initInteractions()
    }

    render() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx)
            throw Helpers.Errors.nullContext

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = 'default'

        ctx.font = '14px serif'
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
        ctx.strokeStyle = '#000000'

        const offsetX = Legend.getOffsetToCenter(this.chart.data.values, this.canvas.width),
            offsetY = (this.canvas.height - Legend.getLegendHeight(this.chart.data.values, this.canvas.width)) / 2

        ctx.translate(offsetX, offsetY)

        for (const value of this.chart.data.values.filter(v => !v.hideInLegend))
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y, offsetX, offsetY)

        ctx.translate(-offsetX, -offsetY)

        requestAnimationFrame(this.render.bind(this))

        this.#onClickEvent = this.#button.render(this.#onMouseMoveEvent, this.#onClickEvent)

        this.#isInit = true
    }

    #draw(value: BasePoint,
          x: number,
          y: number,
          offsetX: number,
          offsetY: number)
        : Point {
        const ctx = this.canvas.getContext('2d', {willReadFrequently: true})

        if (!ctx)
            throw Helpers.Errors.nullContext

        const textWidth = Helper.stringWidth(value.label),
            circleRadius = 10

        if (x + 50 + textWidth >= this.canvas.width - 100 - offsetX) {
            x = 20
            y += 38
        }

        let rectX = x - circleRadius - circleRadius,
            rectY = y - circleRadius / 2 - circleRadius,
            rectW = circleRadius + circleRadius + 32 + textWidth,
            rectH = circleRadius + circleRadius + circleRadius

        const isHover = (event: MouseEvent | undefined) => {
            if (!event)
                return false

            const px = event.clientX - this.#canvasPosition.x + window.scrollX - offsetX,
                py = event.clientY - this.#canvasPosition.y + window.scrollY - offsetY

            return px >= rectX && px <= rectX + rectW
                && py >= rectY && py <= rectY + rectH
        }

        if (this.#onClickEvent) {
            this.animations.add(value.id,
                AnimationType.Click,
                {
                    duration: 220,
                    continuous: true,
                    before: () => {
                        return isHover(this.#onClickEvent) && value.checkCondition()
                    },
                    body: transition => {
                        value.toggle(transition)

                        if (transition === 1)
                            this.#onClickEvent = new PointerEvent('click')
                    }
                })
        }

        if (this.#onMouseMoveEvent) {
            if (isHover(this.#onMouseMoveEvent))
                this.canvas.style.cursor = 'pointer'

            this.animations.add(value.id,
                AnimationType.MouseLeave,
                {
                    duration: 100,
                    before: () => {
                        return !isHover(this.#onMouseMoveEvent) && !this.#isInit
                    },
                    body: transition => {
                        ctx.beginPath()

                        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

                        ctx.fillStyle = Helper.adjustColor('#ffffff', Math.round(-50 * (1 - transition)))
                        ctx.fill()
                    }
                })

            this.animations.add(value.id,
                AnimationType.MouseOver,
                {
                    duration: 100,
                    before: () => {
                        return isHover(this.#onMouseMoveEvent)
                    },
                    body: transition => {
                        ctx.beginPath()

                        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

                        ctx.fillStyle = Helper.adjustColor('#ffffff', Math.round(-50 * transition))
                        ctx.fill()
                    }
                })
        }

        ctx.beginPath()

        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI)
        ctx.fillStyle = value.disabled ? Helper.grayScale(value.color) : value.color
        ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.fillText(value.label, x + 20, y + 4)

        x += 20

        if (value.disabled) {
            ctx.beginPath()
            ctx.moveTo(x - 5, y)
            ctx.lineTo(x + textWidth, y)
            ctx.stroke()
        }

        x += textWidth + 45

        return {
            x: x,
            y: y
        }
    }

    #initInteractions() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY

        if (!this.#isInit) {
            this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
            this.canvas.onclick = event => this.#onClickEvent = event
        }
    }

    refresh() {
        this.#isInit = false
    }

    resize() {
        this.#initInteractions()
    }

    static getOffsetToCenter(values: BasePoint[], width: number) : number {
        let maxWidth = 20

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label)

            if (maxWidth + labelWidth + 47 >= width - 100)
                break

            maxWidth += labelWidth + 47
        }

        return width / 2 - maxWidth / 2
    }

    static getLegendHeight(values: BasePoint[], width: number): number {
        let count = 1,
            acc = 20,
            offset = Legend.getOffsetToCenter(values, width)

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label)

            if (acc + labelWidth + 57 >= width - 100 - offset) {
                acc = 20
                count++
            }

            acc += labelWidth + 57
        }

        return count * 40
    }
}