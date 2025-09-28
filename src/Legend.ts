class Legend extends Renderable {
    #button: Button

    #offset: Point

    isDestroy: boolean = false

    constructor(node: HTMLElement, settings: ChartSettings) {
        super(node, settings)

        this.calculateSizes()

        this.#button = new Button(this.canvas,
            {
                x: -10,
                y: 10,
                text: TextResources.reset,
                action: () => {
                    for (let value of settings.data.values)
                        value.reset()
                }
            })

        this.#offset = {
            x: Legend.getOffsetToCenter(this.settings.data.values, this.canvas.width),
            y: (this.canvas.height - Legend.getLegendHeight(this.settings.data.values, this.canvas.width)) / 2
        }
    }

    render() {
        super.render()

        const ctx = Helpers.Canvas.getContext(this.canvas)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = Styles.Cursor.Default

        Helpers.TextStyles.regular(ctx)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        ctx.translate(this.#offset.x, this.#offset.y)

        for (const value of this.settings.data.values.filter(v => !v.hideInLegend))
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y)

        ctx.translate(-this.#offset.x, -this.#offset.y)

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))

        this.onClickEvent = this.#button.render(this.onMouseMoveEvent, this.onClickEvent)

        this.isInit = true
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

            const px = event.clientX - this.canvasPosition.x + scrollX - this.#offset.x,
                py = event.clientY - this.canvasPosition.y + scrollY - this.#offset.y

            return px >= rectX && px <= rectX + rectW
                   && py >= rectY && py <= rectY + rectH
        }

        if (this.onClickEvent) {
            this.animations.add(value.id,
                AnimationType.Click,
                {
                    duration: Constants.Animations.legend,
                    continuous: true,
                    before: () => {
                        return isHover(this.onClickEvent) && value.checkCondition()
                    },
                    body: transition => {
                        value.toggle(transition)

                        if (transition == 1)
                            this.onClickEvent = new PointerEvent(Events.Click)
                    }
                })
        }

        const translate = (transition: number, event: AnimationType) => {
            this.animations.reload(value.id, event)

            ctx.beginPath()

            ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

            ctx.fillStyle = Helper.adjustColor(Theme.background, Math.round(-50 * transition))
            ctx.fill()
        }

        if (isHover(this.onMouseMoveEvent)) {
            this.animations.add(value.id,
                AnimationType.MouseOver,
                {
                    duration: 100,
                    body: transition => {
                        translate(transition, AnimationType.MouseLeave)
                    }
                })

            this.canvas.style.cursor = Styles.Cursor.Pointer
        } else {
            this.animations.add(value.id,
                AnimationType.MouseLeave,
                {
                    timer: Constants.Dates.minDate,
                    duration: 100,
                    backward: true,
                    body: transition => {
                        translate(transition, AnimationType.MouseOver)
                    }
                })
        }

        ctx.beginPath()

        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI)
        ctx.fillStyle = value.disabled ? Helper.grayScale(value.color) : value.color
        ctx.fill()

        ctx.fillStyle = Theme.text
        ctx.fillText(value.label, x + 20, y + 4)

        x += 20

        if (value.disabled) {
            ctx.moveTo(x - 5, y)
            ctx.lineTo(x + textWidth, y)
            ctx.strokeStyle = Theme.text
            ctx.stroke()
        }

        x += textWidth + 45

        return {
            x: x,
            y: y
        }
    }

    destroy() {
        this.isDestroy = true

        this.canvas.remove()
    }

    refresh() {
        this.isInit = false
    }

    resize() {
        this.calculateSizes()
        this.#button.resize()
        this.initAnimations()
    }

    calculateSizes() {
        switch (this.settings.legendPlace) {
            case LegendPlace.Bottom:
            default:
                this.canvas.width = this.settings.width
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

                this.node.style.flexDirection = Styles.FlexDirection.Column

                break

            case LegendPlace.Top:
                this.canvas.width = this.settings.width
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

                this.node.style.flexDirection = Styles.FlexDirection.ColumnReverse

                break

            case LegendPlace.Left:
                this.canvas.width = 500
                this.canvas.height = this.settings.height

                this.node.style.flexDirection = Styles.FlexDirection.Row

                break

            case LegendPlace.Right:
                this.canvas.width = 500
                this.canvas.height = this.settings.height

                this.node.style.flexDirection = Styles.FlexDirection.RowReverse

                break
        }
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