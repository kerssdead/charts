class OButton {
    /**
     * @type {OChart}
     */
    #chart

    /**
     * @type {HTMLCanvasElement}
     */
    #canvas

    /**
     * @type {OButtonOptions}
     */
    #options

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {OAnimations}
     */
    animations

    /**
     * @type {boolean}
     */
    #isInit

    /**
     * @param chart {OChart}
     * @param canvas {HTMLCanvasElement}
     * @param options {OButtonOptions}
     */
    constructor(chart, canvas, options) {
        this.#chart = chart
        this.#canvas = canvas
        this.#options = options

        this.animations = new OAnimations()

        this.#initAnimations()
    }

    /**
     * @param moveEvent {MouseEvent}
     * @param clickEvent {MouseEvent}
     *
     * @return MouseEvent
     */
    render(moveEvent, clickEvent) {
        if (!this.#isInit)
            this.#initAnimations()

        let ctx = this.#canvas.getContext('2d', { willReadFrequently: true })

        const width = OHelper.stringWidth(this.#options.text) + 20,
            height = 24

        ctx.beginPath()

        let x = this.#options.x + width > this.#canvas.width ? this.#canvas.width - width : this.#options.x,
            y = this.#options.y + height > this.#canvas.height ? this.#canvas.height - height : this.#options.y

        const isOnButton = this.#isOnButton(moveEvent, x, y, width, height)

        if (isOnButton) {
            this.#canvas.style.cursor = 'pointer'

            if (clickEvent && this.#isOnButton(clickEvent, x, y, width, height)) {
                this.#options.action()
                clickEvent = undefined
            }

            this.animations.add({ id: 'animation-button' },
                OAnimationTypes.mouseover,
                {
                    duration: 300,
                    before: () => {
                        return clickEvent === undefined
                    },
                    body: transition => {
                        this.animations.reload({ id: 'animation-button-leave' }, OAnimationTypes.mouseleave)

                        ctx.fillStyle = OHelper.adjustColor('#ffffff', 60 - Math.round(transition * 100))
                    }
                })
        } else {
            this.#canvas.style.cursor = 'default'

            this.animations.add({ id: 'animation-button-leave' },
                OAnimationTypes.mouseleave,
                {
                    duration: 300,
                    body: transition => {
                        this.animations.reload({ id: 'animation-button' }, OAnimationTypes.mouseover)

                        ctx.fillStyle = OHelper.adjustColor('#ffffff', 60 - Math.round((1 - transition) * 100))
                    }
                })
        }

        ctx.shadowBlur = null
        ctx.strokeStyle = '#ffffff'
        ctx.roundRect(x, y, width, height, 4)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '14px serif'
        ctx.fillText(this.#options.text, x + width / 2, y + height / 2)

        ctx.closePath()

        this.#isInit = true

        return clickEvent
    }

    #initAnimations() {
        this.#canvasPosition = this.#canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY
    }

    /**
     * @param event {MouseEvent}
     * @param x {number}
     * @param y {number}
     * @param w {number}
     * @param h {number}
     *
     * @return {boolean}
     */
    #isOnButton(event, x, y, w, h) {
        if (!event)
            return false

        let trueX = event.clientX - this.#canvasPosition.x + window.scrollX,
            trueY = event.clientY - this.#canvasPosition.y + window.scrollY

        return trueX >= x && trueX <= x + w
            && trueY >= y && trueY <= y + h
    }

    refresh() {
        this.#isInit = false
    }
}