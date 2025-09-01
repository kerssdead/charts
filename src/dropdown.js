import { OAnimations } from '/src/animations.js'
import { OAnimationTypes } from '/src/enums.js'
import { OHelper } from '/src/helper.js'

export class ODropdown {
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
     * @type {OAnimations}
     */
    animations

    /**
     * @type {boolean}
     */
    isActive = false

    /**
     * @type {boolean}
     */
    #isInit

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

            if (clickEvent && moveEvent.x === clickEvent.x && moveEvent.y === clickEvent.y) {
                this.isActive = !this.isActive
                clickEvent = undefined
            }

            if (!this.isActive)
                this.animations.add({ id: 'animation-dropdown' },
                    OAnimationTypes.mouseover,
                    {
                        duration: 300,
                        body: transition => {
                            this.animations.reload({ id: 'animation-dropdown' }, OAnimationTypes.mouseleave)

                            ctx.fillStyle = OHelper.adjustColor('#ffffff', -Math.round(40 * transition))
                        }
                    })
            else
                ctx.fillStyle = OHelper.adjustColor('#ffffff', -40)
        } else {
            this.#canvas.style.cursor = 'default'

            if (!this.isActive)
                this.animations.add({ id: 'animation-dropdown' },
                    OAnimationTypes.mouseleave,
                    {
                        duration: 300,
                        body: transition => {
                            this.animations.reload({ id: 'animation-dropdown' }, OAnimationTypes.mouseover)

                            ctx.fillStyle = OHelper.adjustColor('#ffffff', -Math.round((1 - transition) * 40))
                        }
                    })
            else
                ctx.fillStyle = OHelper.adjustColor('#ffffff', -40)
        }

        ctx.strokeStyle = '#ffffff'
        ctx.roundRect(x, y, width, height, 4)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '14px serif'
        ctx.fillText(this.#options.text, x + width / 2, y + height / 2)

        ctx.closePath()

        if (this.isActive) {
            y += height

            let maxWidth = Math.max(this.#options.items.map(value => OHelper.stringWidth(value.text))) + 8

            if (maxWidth < 50)
                maxWidth = 50

            if (x + maxWidth > this.#canvas.width - 4)
                x -= x + maxWidth - this.#canvas.width + 4

            ctx.beginPath()
            ctx.roundRect(x, y, maxWidth, this.#options.items.length * 20 + 8, 4)
            ctx.fillStyle = '#ffffff'
            ctx.strokeStyle = '#353535'
            ctx.fill()
            ctx.stroke()

            ctx.closePath()
            ctx.beginPath()

            y += 4

            for (const item of this.#options.items) {
                if (this.#isOnButton(moveEvent, x, y, maxWidth, 20)) {
                    this.animations.add({ id: 'animation-dropdown' + item.text },
                        OAnimationTypes.mouseover,
                        {
                            duration: 300,
                            before: () => {
                                return clickEvent === undefined
                            },
                            body: transition => {
                                this.animations.reload({ id: 'animation-dropdown' + item.text }, OAnimationTypes.mouseleave)

                                ctx.fillStyle = OHelper.adjustColor('#ffffff', 60 - Math.round(transition * 100))
                            }
                        })

                    this.#canvas.style.cursor = 'pointer'

                    if (clickEvent) {
                        item.action()

                        clickEvent = undefined
                        this.isActive = false
                    }
                } else {
                    this.animations.add({ id: 'animation-dropdown' + item.text },
                        OAnimationTypes.mouseleave,
                        {
                            duration: 300,
                            body: transition => {
                                this.animations.reload({ id: 'animation-dropdown' }, OAnimationTypes.mouseover)

                                ctx.fillStyle = OHelper.adjustColor('#ffffff', 60 - Math.round((1 - transition) * 100))
                            }
                        })
                }

                ctx.rect(x, y, maxWidth, 20)
                ctx.fill()

                ctx.fillStyle = '#000000'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'hanging'
                ctx.fillText(item.text, x + maxWidth / 2, y + 4)

                y += 20
            }

            ctx.closePath()

            ctx.fillStyle = '#000000'
        }

        if (clickEvent !== undefined && this.isActive) {
            this.isActive = false
            clickEvent = undefined
        }

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