class Legend {
    canvas: HTMLCanvasElement

    animations: Animations

    #canvasPosition: DOMRect

    #onMouseMoveEvent: MouseEvent

    #onClickEvent: MouseEvent | undefined

    #isInit: boolean = false

    #button: Button

    #settings: ChartSettings

    #offset: Point

    constructor(settings: ChartSettings, context: HTMLElement) {
        this.#settings = settings

        this.canvas = document.createElement(Tag.Canvas)

        switch (settings.legendPlace) {
            case LegendPlace.Bottom:
            default:
                this.canvas.width = settings.width
                this.canvas.height = Legend.getLegendHeight(settings.data.values, this.canvas.width)

                context.style.flexDirection = 'column'

                break

            case LegendPlace.Top:
                this.canvas.width = settings.width
                this.canvas.height = Legend.getLegendHeight(settings.data.values, this.canvas.width)

                context.style.flexDirection = 'column-reverse'

                break

            case LegendPlace.Left:
                this.canvas.width = 500
                this.canvas.height = settings.height

                context.style.flexDirection = 'row'

                break

            case LegendPlace.Right:
                this.canvas.width = 500
                this.canvas.height = settings.height

                context.style.flexDirection = 'row-reverse'

                break
        }

        context.append(this.canvas)

        this.animations = new Animations()

        this.#button = new Button(this.canvas,
            {
                x: -10,
                y: 10,
                text: 'Reset',
                action: () => {
                    for (let value of settings.data.values)
                        value.reset()
                }
            })

        this.#initInteractions()
    }

    render() {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = 'default'

        Helpers.TextStyles.regular(ctx)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        this.#offset = {
            x: Legend.getOffsetToCenter(this.#settings.data.values, this.canvas.width),
            y: (this.canvas.height - Legend.getLegendHeight(this.#settings.data.values, this.canvas.width)) / 2
        }

        ctx.translate(this.#offset.x, this.#offset.y)

        for (const value of this.#settings.data.values.filter(v => !v.hideInLegend))
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y)

        ctx.translate(-this.#offset.x, -this.#offset.y)

        requestAnimationFrame(this.render.bind(this))

        this.#onClickEvent = this.#button.render(this.#onMouseMoveEvent, this.#onClickEvent)

        this.#isInit = true
    }

    #draw(value: Value, x: number, y: number): Point {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        const textWidth = Helper.stringWidth(value.label),
            circleRadius = 10

        if (x + 50 + textWidth >= this.canvas.width - 100 - this.#offset.x) {
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

            const px = event.clientX - this.#canvasPosition.x + scrollX - this.#offset.x,
                py = event.clientY - this.#canvasPosition.y + scrollY - this.#offset.y

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

                        if (transition == 1)
                            this.#onClickEvent = new PointerEvent(Events.Click)
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
            ctx.moveTo(x - 5, y)
            ctx.lineTo(x + textWidth, y)
            ctx.strokeStyle = '#000000'
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

        this.#canvasPosition.x += scrollX
        this.#canvasPosition.y += scrollY

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

    static getOffsetToCenter(values: Value[], width: number): number {
        let maxWidth = 20

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label)

            if (maxWidth + labelWidth + 47 >= width - 100)
                break

            maxWidth += labelWidth + 47
        }

        return width / 2 - maxWidth / 2
    }

    static getLegendHeight(values: Value[], width: number): number {
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