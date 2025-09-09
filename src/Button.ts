class Button {
    #canvas: HTMLCanvasElement

    #options: ButtonOptions

    #canvasPosition: DOMRect

    animations: Animations

    #isInit: boolean

    #position: DOMRect

    constructor(canvas: HTMLCanvasElement, options: ButtonOptions) {
        this.#canvas = canvas
        this.#options = options

        this.animations = new Animations()

        this.#initAnimations()

        const width = Helper.stringWidth(this.#options.text) + 20,
            height = 24

        this.#position = <DOMRect>{
            x: this.#options.x + width > this.#canvas.width
                ? this.#canvas.width - width
                : this.#options.x < 0
                    ? this.#canvas.width + this.#options.x - width
                    : this.#options.x,
            y: this.#options.y + height > this.#canvas.height
                ? this.#canvas.height - height
                : this.#options.y < 0
                    ? this.#canvas.height + this.#options.y - height
                    : this.#options.y,
            width: width,
            height: height
        }
    }

    render(moveEvent: MouseEvent, clickEvent: MouseEvent | undefined) {
        if (!this.#isInit)
            this.#initAnimations()

        const ctx = Helpers.Canvas.getContext(this.#canvas)

        ctx.beginPath()

        if (this.#isOnButton(moveEvent)) {
            this.#canvas.style.cursor = 'pointer'

            if (clickEvent && this.#isOnButton(clickEvent)) {
                this.#options.action()
                clickEvent = undefined
            }

            this.animations.add('animation-button',
                AnimationType.MouseOver,
                {
                    duration: 300,
                    before: () => {
                        return clickEvent == undefined
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
        ctx.roundRect(this.#position.x, this.#position.y, this.#position.width, this.#position.height, 4)
        ctx.fill()

        Helpers.TextStyles.regular(ctx)
        ctx.fillText(this.#options.text,
            this.#position.x + this.#position.width / 2,
            this.#position.y + this.#position.height / 2)

        this.#isInit = true

        return clickEvent
    }

    #initAnimations() {
        this.#canvasPosition = this.#canvas.getBoundingClientRect()

        this.#canvasPosition.x += scrollX
        this.#canvasPosition.y += scrollY
    }

    #isOnButton(event: MouseEvent): boolean {
        if (!event)
            return false

        let trueX = event.clientX - this.#canvasPosition.x + scrollX,
            trueY = event.clientY - this.#canvasPosition.y + scrollY

        return trueX >= this.#position.x && trueX <= this.#position.x + this.#position.width
            && trueY >= this.#position.y && trueY <= this.#position.y + this.#position.height
    }
}