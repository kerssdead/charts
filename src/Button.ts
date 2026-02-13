import TextStyles from 'helpers/TextStyles'
import Theme from 'Theme'
import Animations from 'Animations'
import * as Helper from 'Helper'
import ButtonOptions from 'types/ButtonOptions'
import Canvas from 'helpers/Canvas'
import { AnimationType } from 'static/Enums'
import * as Constants from 'static/constants/Index'
import Styles from 'static/constants/Styles'

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
    }

    render(moveEvent: MouseEvent, clickEvent: MouseEvent | undefined) {
        if (!this.#isInit)
            this.#initAnimations()

        const ctx = Canvas.getContext(this.#canvas)

        ctx.beginPath()

        const translate = (transition: number, event: AnimationType) => {
            this.animations.reload('animation-button', event)

            ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, -Math.round(transition * 25))
        }

        if (this.#isOnButton(moveEvent)) {
            if (clickEvent && this.#isOnButton(clickEvent)) {
                this.#options.action()
                clickEvent = undefined
            }

            this.animations.handle('animation-button',
                AnimationType.MouseOver,
                {
                    duration: 300,
                    body: transition => {
                        translate(transition, AnimationType.MouseLeave)
                    }
                })
        } else {
            this.animations.handle('animation-button',
                AnimationType.MouseLeave,
                {
                    timer: Constants.Dates.minDate,
                    duration: 300,
                    backward: true,
                    body: transition => {
                        translate(transition, AnimationType.MouseOver)
                    }
                })
        }

        ctx.roundRect(this.#position.x, this.#position.y, this.#position.width, this.#position.height, 4)
        ctx.fill()

        TextStyles.regular(ctx)
        ctx.fillText(this.#options.text,
            this.#position.x + this.#position.width / 2,
            this.#position.y + this.#position.height / 2)

        this.#isInit = true

        return clickEvent
    }

    resize() {
        this.#initAnimations()
    }

    #initAnimations() {
        this.#canvasPosition = this.#canvas.getBoundingClientRect()

        const width = Helper.stringWidth(this.#options.text) + 12,
            height = 20

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

    #isOnButton(event: MouseEvent): boolean {
        if (!event)
            return false

        let trueX = event.offsetX,
            trueY = event.offsetY

        return trueX >= this.#position.x && trueX <= this.#position.x + this.#position.width
               && trueY >= this.#position.y && trueY <= this.#position.y + this.#position.height
    }
}

export default Button