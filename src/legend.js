class Legend {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {Chart}
     */
    chart

    /**
     * @type {Animations}
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
     * @param chart {Chart}
     */
    constructor(chart) {
        this.chart = chart

        this.canvas = document.createElement('canvas')

        this.canvas.width = 1600
        this.canvas.height = 200

        chart.node.append(this.canvas)

        this.#globalTimer = new Date()

        this.animations = new Animations()
    }

    render() {
        if (!this.#isInit) {
            this.#initInteractions()
            this.#isInit = true
        }

        const ctx = this.canvas.getContext('2d')

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        let nextPoint = { x: 20, y: 20 }

        this.canvas.style.cursor = 'default'

        for (const value of this.chart.data.values) {
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y)
        }

        requestAnimationFrame(this.render.bind(this))
    }

    /**
     * @param value {BasePoint}
     * @param x {number}
     * @param y {number}
     *
     * @return {Point}
     */
    #draw(value, x, y) {
        const ctx = this.canvas.getContext('2d')

        const textWidth = value.label.width(18),
            circleRadius = 10

        if (x + 50 + textWidth >= this.canvas.width) {
            x = 20
            y += 38
        }

        let rectX = x - circleRadius - circleRadius,
            rectY = y - circleRadius / 2 - circleRadius,
            rectW = circleRadius + circleRadius + 20 + textWidth,
            rectH = circleRadius + circleRadius + circleRadius

        const isHover = event => {
            const px = event.clientX - this.#canvasPosition.x,
                py = event.clientY - this.#canvasPosition.y

            return px >= rectX && px <= rectX + rectW
                && py >= rectY && py <= rectY + rectH
        }

        if (this.#onClickEvent) {
            this.animations.add(value,
                AnimationTypes.click,
                {
                    timer: null,
                    duration: 250,
                    before: () => {
                        return isHover(this.#onClickEvent)
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        if (value.disabled)
                            value.current = value.value * (1 - passed / duration)
                        else
                            value.current = value.value * passed / duration

                        if (passed === 0)
                            value.disabled = !value.disabled

                        if (passed === duration)
                            this.#onClickEvent = new PointerEvent('click')
                    }
                })
        }

        if (this.#onMouseMoveEvent) {
            this.animations.add(value,
                AnimationTypes.mouseleave,
                {
                    timer: null,
                    duration: 100,
                    before: () => {
                        return !isHover(this.#onMouseMoveEvent)
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        ctx.beginPath()

                        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

                        ctx.fillStyle = adjustColor('#ffffff', Math.round(-50 * (1 - passed / duration)))
                        ctx.fill()

                        this.canvas.style.cursor = 'pointer'
                    }
                })

            this.animations.add(value,
                AnimationTypes.mouseover,
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

                        ctx.fillStyle = adjustColor('#ffffff', Math.round(-50 * passed / duration))
                        ctx.fill()

                        this.canvas.style.cursor = 'pointer'
                    }
                })
        }

        ctx.beginPath()

        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI)
        ctx.fillStyle = value.disabled ? grayScale(value.color) : value.color
        ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.font = '18px serif'
        ctx.font
        ctx.fillText(value.label, x += 20, y + 4)

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