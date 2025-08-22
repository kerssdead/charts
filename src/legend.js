class OLegend {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {OChart}
     */
    chart

    /**
     * @type {OAnimations}
     */
    animations

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
     * @type {Date}
     */
    #globalTimer

    /**
     * @type {boolean}
     */
    #isInit = false

    /**
     * @type {OButton}
     */
    #button

    /**
     * @param chart {OChart}
     * @param context {HTMLElement}
     */
    constructor(chart, context) {
        this.chart = chart

        this.canvas = document.createElement('canvas')

        this.canvas.style.width = 'fit-content'

        switch (chart.settings.legendPlace) {
            case OLegendPlaces.bottom:
                this.canvas.width = this.chart.settings.width
                this.canvas.height = OLegend.getLegendHeight(this.chart.data.values, this.canvas.width)

                context.style.flexDirection = 'column'

                break

            case OLegendPlaces.top:
                this.canvas.width = this.chart.settings.width
                this.canvas.height = OLegend.getLegendHeight(this.chart.data.values, this.canvas.width)

                context.style.flexDirection = 'column-reverse'

                break

            case OLegendPlaces.left:
                this.canvas.width = 500
                this.canvas.height = this.chart.settings.height

                context.style.flexDirection = 'row'

                break

            case OLegendPlaces.right:
                this.canvas.width = 500
                this.canvas.height = this.chart.settings.height

                context.style.flexDirection = 'row-reverse'

                break
        }

        chart.node.append(this.canvas)

        this.#globalTimer = new Date()

        this.animations = new OAnimations()

        this.#button = new OButton(this.chart,
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
    }

    render() {
        if (!this.#isInit)
            this.#initInteractions()

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = 'default'

        const offsetX = OLegend.getOffsetToCenter(this.chart.data.values, this.canvas.width),
            offsetY = (this.canvas.height - OLegend.getLegendHeight(this.chart.data.values, this.canvas.width)) / 2

        ctx.translate(offsetX, offsetY)

        for (const value of this.chart.data.values.filter(v => !v.hideInLegend))
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y, offsetX, offsetY)

        ctx.translate(-offsetX, -offsetY)

        requestAnimationFrame(this.render.bind(this))

        if (!this.#isInit)
            this.canvas.dispatchEvent(new MouseEvent('mousemove'))

        const isCursorPointer = this.canvas.style.cursor === 'pointer'

        this.#onClickEvent = this.#button.render(this.#onMouseMoveEvent, this.#onClickEvent)

        if (isCursorPointer)
            this.canvas.style.cursor = 'pointer'

        this.#isInit = true
    }

    /**
     * @param value {OBasePoint}
     * @param x {number}
     * @param y {number}
     * @param offsetX {number}
     * @param offsetY {number}
     *
     * @return {OPoint}
     */
    #draw(value, x, y, offsetX, offsetY) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const textWidth = OHelper.stringWidth(value.label),
            circleRadius = 10

        if (x + 50 + textWidth >= this.canvas.width - 100 - offsetX) {
            x = 20
            y += 38
        }

        let rectX = x - circleRadius - circleRadius,
            rectY = y - circleRadius / 2 - circleRadius,
            rectW = circleRadius + circleRadius + 32 + textWidth,
            rectH = circleRadius + circleRadius + circleRadius

        const isHover = event => {
            if (!event)
                return false

            const px = event.clientX - this.#canvasPosition.x + window.scrollX - offsetX,
                py = event.clientY - this.#canvasPosition.y + window.scrollY - offsetY

            return px >= rectX && px <= rectX + rectW
                && py >= rectY && py <= rectY + rectH
        }

        if (this.#onClickEvent) {
            this.animations.add(value,
                OAnimationTypes.click,
                {
                    duration: 220,
                    continuous: true,
                    before: () => {
                        return isHover(this.#onClickEvent) && value.checkCondition()
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        value.toggle(passed, duration)

                        if (passed === duration)
                            this.#onClickEvent = new PointerEvent('click')
                    }
                })
        }

        if (this.#onMouseMoveEvent) {
            if (isHover(this.#onMouseMoveEvent))
                this.canvas.style.cursor = 'pointer'

            this.animations.add(value,
                OAnimationTypes.mouseleave,
                {
                    duration: 100,
                    before: () => {
                        return !isHover(this.#onMouseMoveEvent) && !this.#isInit
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        ctx.beginPath()

                        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

                        ctx.fillStyle = OHelper.adjustColor('#ffffff', Math.round(-50 * (1 - passed / duration)))
                        ctx.fill()
                    }
                })

            this.animations.add(value,
                OAnimationTypes.mouseover,
                {
                    duration: 100,
                    before: () => {
                        return isHover(this.#onMouseMoveEvent)
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        ctx.beginPath()

                        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

                        ctx.fillStyle = OHelper.adjustColor('#ffffff', Math.round(-50 * passed / duration))
                        ctx.fill()
                    }
                })
        }

        ctx.beginPath()

        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI)
        ctx.fillStyle = value.disabled ? OHelper.grayScale(value.color) : value.color
        ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.font = '14px serif'
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(value.label, x + 20, y + 4)

        x += 20

        if (value.disabled) {
            ctx.beginPath()
            ctx.moveTo(x - 5, y)
            ctx.lineTo(x + textWidth, y)
            ctx.fillStyle = '#000000'
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

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY

        this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
        this.canvas.onclick = event => this.#onClickEvent = event
    }

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
    }

    refresh() {
        this.#isInit = false
    }

    /**
     * @param values {OBasePoint[]}
     * @param width {number}
     *
     * @returns {number}
     */
    static getOffsetToCenter(values, width) {
        let maxWidth = 20

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = OHelper.stringWidth(value.label)

            if (maxWidth + labelWidth + 47 >= width - 100)
                break

            maxWidth += labelWidth + 47
        }

        return width / 2 - maxWidth / 2
    }

    /**
     * @param values {OBasePoint[]}
     * @param width {number}
     *
     * @return {int}
     */
    static getLegendHeight(values, width) {
        let count = 1,
            acc = 20,
            offset = OLegend.getOffsetToCenter(values, width)

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = OHelper.stringWidth(value.label)

            if (acc + labelWidth + 57 >= width - 100 - offset) {
                acc = 20
                count++
            }

            acc += labelWidth + 57
        }

        return count * 40
    }
}