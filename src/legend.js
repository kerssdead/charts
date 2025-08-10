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
     * @type {ODropdown}
     */
    #dropdown

    /**
     * @param chart {OChart}
     * @param context {HTMLElement}
     */
    constructor(chart, context) {
        this.chart = chart

        this.canvas = document.createElement('canvas')

        this.canvas.width = 1600
        this.canvas.height = 200
        this.canvas.style.width = 'fit-content'

        switch (chart.settings.legendPlace) {
            case OLegendPlaces.bottom:
                this.canvas.width = this.chart.settings.width > this.chart.settings.height
                    ? this.chart.settings.height
                    : this.chart.settings.width

                context.style.flexDirection = 'column'

                break

            case OLegendPlaces.top:
                this.canvas.width = this.chart.settings.width > this.chart.settings.height
                    ? this.chart.settings.height
                    : this.chart.settings.width

                context.style.flexDirection = 'column-reverse'

                break

            case OLegendPlaces.left:
                this.canvas.width = 500

                context.style.flexDirection = 'row'

                break

            case OLegendPlaces.right:
                this.canvas.width = 500

                context.style.flexDirection = 'row-reverse'

                break
        }

        chart.node.append(this.canvas)

        this.#globalTimer = new Date()

        this.animations = new OAnimations()

        this.#dropdown = new ODropdown(this.chart,
            this.canvas,
            {
                x: this.canvas.width - 110,
                y: 10,
                text: 'Menu',
                items: [
                    {
                        text: 'Reset',
                        action: () => {
                            for (let value of this.chart.data.values)
                                value.disabled = false
                        }
                    }
                ]
            })
    }

    render() {
        if (!this.#isInit)
            this.#initInteractions()

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = 'default'

        for (const value of this.chart.data.values)
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y)

        requestAnimationFrame(this.render.bind(this))

        if (!this.#isInit)
            this.canvas.dispatchEvent(new MouseEvent('mousemove'))

        const isCursorPointer = this.canvas.style.cursor === 'pointer'

        this.#onClickEvent = this.#dropdown.render(this.#onMouseMoveEvent, this.#onClickEvent)

        if (isCursorPointer)
            this.canvas.style.cursor = 'pointer'

        this.#isInit = true
    }

    /**
     * @param value {OBasePoint}
     * @param x {number}
     * @param y {number}
     *
     * @return {OPoint}
     */
    #draw(value, x, y) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const textWidth = OHelper.stringWidth(value.label),
            circleRadius = 10

        if (x + 50 + textWidth >= this.canvas.width - 100) {
            x = 20
            y += 38
        }

        let rectX = x - circleRadius - circleRadius,
            rectY = y - circleRadius / 2 - circleRadius,
            rectW = circleRadius + circleRadius + 20 + textWidth,
            rectH = circleRadius + circleRadius + circleRadius

        const isHover = event => {
            const px = event.clientX - this.#canvasPosition.x + window.scrollX,
                py = event.clientY - this.#canvasPosition.y + window.scrollY

            return px >= rectX && px <= rectX + rectW
                && py >= rectY && py <= rectY + rectH
                && !this.#dropdown.isActive
        }

        if ((this.#onClickEvent || (value.current === 0 && !value.disabled)) && !this.#dropdown.isActive) {
            this.animations.add(value,
                OAnimationTypes.click,
                {
                    timer: null,
                    duration: 220,
                    continuous: true,
                    before: () => {
                        return (value.current === 0 && !value.disabled) || (isHover(this.#onClickEvent) && value.value !== 0)
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        if (passed === 0 && this.#onClickEvent)
                            value.disabled = !value.disabled

                        if (value.disabled)
                            value.current = value.value * (1 - passed / duration)
                        else
                            value.current = value.value * passed / duration

                        if (passed === duration)
                            this.#onClickEvent = new PointerEvent('click')
                    }
                })
        }

        if (this.#onMouseMoveEvent && !this.#dropdown.isActive) {
            if (isHover(this.#onMouseMoveEvent))
                this.canvas.style.cursor = 'pointer'

            this.animations.add(value,
                OAnimationTypes.mouseleave,
                {
                    timer: null,
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
                    timer: null,
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
        ctx.fillText(value.label, x += 20, y + 4)

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
}