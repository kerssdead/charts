class Button {
    #canvas: HTMLCanvasElement

    #options: ButtonOptions

    #canvasPosition: DOMRect

    animations: Animations

    #isInit: boolean

    constructor(canvas: HTMLCanvasElement, options: ButtonOptions) {
        this.#canvas = canvas
        this.#options = options

        this.animations = new Animations()

        this.#initAnimations()
    }

    /**
     * @return MouseEvent
     */
    render(moveEvent: MouseEvent, clickEvent: MouseEvent | undefined) {
        if (!this.#isInit)
            this.#initAnimations()

        let ctx = this.#canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx)
            throw Helpers.Errors.nullContext

        const width = Helper.stringWidth(this.#options.text) + 20,
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

            this.animations.add('animation-button',
                AnimationType.MouseOver,
                {
                    duration: 300,
                    before: () => {
                        return clickEvent === undefined
                    },
                    body: transition => {
                        this.animations.reload('animation-button-leave', AnimationType.MouseLeave)

                        ctx.fillStyle = Helper.adjustColor('#ffffff', -Math.round(transition * 40))
                    }
                })
        } else {
            this.animations.add('animation-button-leave',
                AnimationType.MouseLeave,
                {
                    duration: 300,
                    body: transition => {
                        this.animations.reload('animation-button', AnimationType.MouseOver)

                        ctx.fillStyle = Helper.adjustColor('#ffffff', -Math.round((1 - transition) * 40))
                    }
                })
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

        this.#isInit = true

        return clickEvent
    }

    #initAnimations() {
        this.#canvasPosition = this.#canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY
    }

    #isOnButton(event: MouseEvent, x: number, y: number, w: number, h: number): boolean {
        if (!event)
            return false

        let trueX = event.clientX - this.#canvasPosition.x + window.scrollX,
            trueY = event.clientY - this.#canvasPosition.y + window.scrollY

        return trueX >= x && trueX <= x + w
            && trueY >= y && trueY <= y + h
    }
}