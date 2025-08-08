class ODropdown {
    /**
     * @type {OChart}
     */
    #chart

    /**
     * @type {HTMLCanvasElement}
     */
    #canvas

    /**
     * @type {ODropdownOptions}
     */
    #options

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
     * @type {OAnimations}
     */
    animations

    /**
     * @type {boolean}
     */
    isActive = false

    /**
     * @param chart {OChart}
     * @param canvas {HTMLCanvasElement}
     * @param options {ODropdownOptions}
     */
    constructor(chart, canvas, options) {
        this.#chart = chart
        this.#canvas = canvas
        this.#options = options

        this.animations = new OAnimations()

        this.#initAnimations()
    }

    /**
     * @param event {MouseEvent}
     */
    render(event) {
        let ctx = this.#canvas.getContext('2d')

        const width = 100, height = 50

        ctx.beginPath()

        ctx.fillStyle = 'red'

        let x = this.#options.x + width > this.#canvas.width ? this.#canvas.width - width : this.#options.x,
            y = this.#options.y + height > this.#canvas.height ? this.#canvas.height - height : this.#options.y

        if (this.#isOnButton(event, x, y, width, height)) {
            if (event.type === 'click') {
                this.isActive = true
                console.log('click')
            }

            this.animations.add({ id: 'animation-dropdown' },
                OAnimationTypes.mouseover,
                {
                    timer: null,
                    duration: 300,
                    before: () => {
                        return true
                    },
                    body: (passed, duration) => {
                        this.animations.reload({ id: 'animation-dropdown' }, OAnimationTypes.mouseleave)

                        if (passed > duration)
                            passed = duration

                        ctx.fillStyle = OHelper.adjustColor('#ff0000', Math.round(passed / duration * 100))
                    }
                })
        } else {
            this.animations.add({ id: 'animation-dropdown' },
                OAnimationTypes.mouseleave,
                {
                    timer: null,
                    duration: 300,
                    before: () => {
                        return true
                    },
                    body: (passed, duration) => {
                        this.animations.reload({ id: 'animation-dropdown' }, OAnimationTypes.mouseover)

                        if (passed > duration)
                            passed = duration

                        ctx.fillStyle = OHelper.adjustColor('#ff0000', Math.round(100 - passed / duration * 100))
                    }
                })
        }

        ctx.rect(x, y, width, height)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.stroke()
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('dropdown', x + width / 2, y + height / 2)

        ctx.closePath()
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
}