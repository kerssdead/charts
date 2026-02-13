import Theme from 'Theme'
import DropdownOptions from 'types/DropdownOptions'
import Animations from 'Animations'
import * as Helper from 'Helper'
import TextStyles from 'helpers/TextStyles'
import Canvas from 'helpers/Canvas'
import { AnimationType } from 'static/Enums'
import * as Constants from 'static/constants/Index'
import Styles from 'static/constants/Styles'

class Dropdown {
    isActive: boolean = false

    #isInit: boolean

    #options: DropdownOptions

    #canvasPosition: DOMRect

    animations: Animations

    #position: DOMRect

    readonly #isOnlyMenu: boolean

    readonly #canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement, options: DropdownOptions) {
        this.#canvas = canvas
        this.#options = options

        if (this.#options.icon)
            this.#options.text = this.#options.icon

        this.#isOnlyMenu = this.#options.text == undefined

        this.animations = new Animations()
    }

    render(moveEvent: MouseEvent, clickEvent: MouseEvent | undefined) {
        if (!this.#isInit)
            this.#initAnimations()

        if (this.#isOnlyMenu)
            this.isActive = true

        const ctx = Canvas.getContext(this.#canvas)

        let x = this.#position.x,
            y = this.#position.y,
            width = this.#position.width,
            height = this.#position.height

        ctx.beginPath()

        if (!this.#isOnlyMenu) {
            const translate = (transition: number, event: AnimationType) => {
                this.animations.reload('animation-dropdown', event)

                ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, -Math.round(25 * transition))
            }

            if (this.#isOnButton(moveEvent, x, y, width, height)) {
                this.#canvas.style.cursor = Styles.Cursor.Pointer

                if (clickEvent && moveEvent.x == clickEvent.x && moveEvent.y == clickEvent.y) {
                    this.isActive = !this.isActive
                    clickEvent = undefined
                }

                if (!this.isActive)
                    this.animations.handle('animation-dropdown',
                        AnimationType.MouseOver,
                        {
                            duration: 300,
                            body: transition => {
                                translate(transition, AnimationType.MouseLeave)
                            }
                        })
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, -25)
            } else {
                this.#canvas.style.cursor = Styles.Cursor.Default

                if (!this.isActive)
                    this.animations.handle('animation-dropdown',
                        AnimationType.MouseLeave,
                        {
                            timer: Constants.Dates.minDate,
                            duration: 300,
                            backward: true,
                            body: transition => {
                                translate(transition, AnimationType.MouseOver)
                            }
                        })
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, -25)
            }

            ctx.roundRect(x, y, width, height, 4)
            ctx.fill()

            TextStyles.regular(ctx)

            if (this.#options.icon)
                ctx.font = '20px sans-serif'

            const iconOffset = this.#options.icon
                               ? navigator.platform != 'Win32'
                                 ? 1
                                 : -1
                               : 0

            ctx.fillText(
                this.#options.text ?? '',
                x + width / 2,
                y + height / 2 - iconOffset
            )
        }

        if (this.isActive) {
            const padding = 6,
                borderRadius = 6

            y += height

            const items = this.#options.items.filter(value => value.text),
                dividers = this.#options.items.filter(value => !value.text)

            let maxWidth = Math.max(...items.map(value => Helper.stringWidth(value.text)))
                           + padding * 4

            if (x + maxWidth > this.#canvas.width - 4)
                x -= x + maxWidth - this.#canvas.width + 4

            const dropdownOpacity = 'bb',
                itemOpacityDec = 127,
                itemBackground = Theme.dropdownItemHoverColor,
                borderColor = Theme.dropdownBorder

            ctx.beginPath()

            const rect = {
                x: x,
                y: y,
                width: maxWidth,
                height: items.length * 26
                        + dividers.length * 4
                        + (items.length == 1 ? padding : 0)
                        + (items.length == 2 && dividers.length == 1 ? padding : 0)
            }

            ctx.roundRect(rect.x, rect.y, rect.width, rect.height, borderRadius)
            ctx.fillStyle = Theme.background + dropdownOpacity
            ctx.setLineDash([])
            ctx.lineWidth = 1
            ctx.strokeStyle = borderColor + dropdownOpacity
            ctx.fill()
            ctx.stroke()

            ctx.beginPath()

            y += 6

            for (const item of this.#options.items) {
                ctx.beginPath()

                if (item.isDivider == true) {
                    y += 2

                    ctx.moveTo(x + padding, y)
                    ctx.lineTo(x + maxWidth - padding, y)

                    ctx.lineWidth = .5
                    ctx.stroke()

                    y += 4

                    continue
                }

                ctx.fillStyle = 'transparent'

                const animationKey = 'animation-dropdown' + item.text

                const translate = (transition: number, event: AnimationType, isReturn?: boolean) => {
                    this.animations.reload(animationKey, event)

                    if (isReturn && transition == 1)
                        return

                    let opacity = Math.round(itemOpacityDec * transition).toString(16)
                    if (opacity.length == 1)
                        opacity = '0' + opacity

                    ctx.fillStyle = itemBackground + opacity
                }

                if (this.#isOnButton(moveEvent, x, y, maxWidth, 20)) {
                    this.animations.handle(animationKey,
                        AnimationType.MouseOver,
                        {
                            duration: 300,
                            body: transition => {
                                translate(transition, AnimationType.MouseLeave)
                            }
                        })

                    this.#canvas.style.cursor = Styles.Cursor.Pointer

                    if (clickEvent) {
                        item.action()

                        clickEvent = undefined
                        this.isActive = false
                    }
                } else {
                    this.animations.handle(animationKey,
                        AnimationType.MouseLeave,
                        {
                            timer: Constants.Dates.minDate,
                            duration: 300,
                            backward: true,
                            body: transition => {
                                translate(transition, AnimationType.MouseOver, true)
                            }
                        })
                }

                ctx.roundRect(x + padding, y, maxWidth - padding * 2, 20, borderRadius)
                ctx.fill()

                TextStyles.regular(ctx)
                ctx.fillStyle = Theme.text
                ctx.textAlign = 'left'
                ctx.textBaseline = 'hanging'
                ctx.fillText(item.text, x + padding * 2, y + 5)

                y += 22
            }
        }

        ctx.lineWidth = 1

        if (!this.#isOnlyMenu && clickEvent != undefined && this.isActive) {
            this.isActive = false
            clickEvent = undefined
        }

        this.#isInit = true

        if (this.#isOnlyMenu && clickEvent && moveEvent.x == clickEvent.x && moveEvent.y == clickEvent.y) {
            this.isActive = !this.isActive
            clickEvent = undefined
        }

        return clickEvent
    }

    #initAnimations() {
        this.#canvasPosition = this.#canvas.getBoundingClientRect()
    }

    #isOnButton(event: MouseEvent, x: number, y: number, w: number, h: number): boolean {
        if (!event)
            return false

        return event.offsetX >= x && event.offsetX <= x + w
               && event.offsetY >= y && event.offsetY <= y + h
    }

    refresh() {
        this.#isInit = false
    }

    resize() {
        this.#initAnimations()
        this.#calculatePosition()
    }

    close() {
        this.isActive = false
    }

    #calculatePosition() {
        const width = this.#isOnlyMenu ? 0 : Helper.stringWidth(this.#options.text ?? '') + 12,
            height = this.#isOnlyMenu ? 0 : 20

        this.#position = {
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
        } as DOMRect
    }
}

export default Dropdown