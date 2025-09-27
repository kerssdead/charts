class Dropdown {
    #canvas: HTMLCanvasElement

    #options: DropdownOptions

    #canvasPosition: DOMRect

    animations: Animations

    isActive: boolean = false

    #isInit: boolean

    #position: DOMRect

    #isOnlyMenu: boolean

    constructor(canvas: HTMLCanvasElement, options: DropdownOptions) {
        this.#canvas = canvas
        this.#options = options

        this.#isOnlyMenu = this.#options.text == undefined

        this.animations = new Animations()

        this.#initAnimations()

        const width = this.#isOnlyMenu ? 0 : Helper.stringWidth(this.#options.text ?? '') + 20,
            height = this.#isOnlyMenu ? 0 : 24

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

        if (this.#isOnlyMenu)
            this.isActive = true

        const ctx = Helpers.Canvas.getContext(this.#canvas)

        let x = this.#position.x,
            y = this.#position.y,
            width = this.#position.width,
            height = this.#position.height

        ctx.beginPath()

        if (!this.#isOnlyMenu) {
            if (this.#isOnButton(moveEvent, x, y, width, height)) {
                this.#canvas.style.cursor = Styles.Cursor.Pointer

                if (clickEvent && moveEvent.x == clickEvent.x && moveEvent.y == clickEvent.y) {
                    this.isActive = !this.isActive
                    clickEvent = undefined
                }

                if (!this.isActive)
                    this.animations.add('animation-dropdown',
                        AnimationType.MouseOver,
                        {
                            duration: 300,
                            body: transition => {
                                this.animations.reload('animation-dropdown', AnimationType.MouseLeave)

                                ctx.fillStyle = Helper.adjustColor(Theme.background, -Math.round(40 * transition))
                            }
                        })
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.background, -40)
            } else {
                this.#canvas.style.cursor = Styles.Cursor.Default

                if (!this.isActive)
                    this.animations.add('animation-dropdown',
                        AnimationType.MouseLeave,
                        {
                            duration: 300,
                            body: transition => {
                                this.animations.reload('animation-dropdown', AnimationType.MouseOver)

                                ctx.fillStyle = Helper.adjustColor(Theme.background, -Math.round((1 - transition) * 40))
                            }
                        })
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.background, -40)
            }

            ctx.strokeStyle = Theme.background
            ctx.roundRect(x, y, width, height, 4)
            ctx.fill()

            Helpers.TextStyles.regular(ctx)
            ctx.fillText(this.#options.text ?? '', x + width / 2, y + height / 2)
        }

        if (this.isActive) {
            y += height

            const items = this.#options.items.filter(value => value.text),
                dividers = this.#options.items.filter(value => !value.text)

            let maxWidth = Math.max(...items.map(value => Helper.stringWidth(value.text)))
                + 24

            if (maxWidth < 50)
                maxWidth = 50

            if (x + maxWidth > this.#canvas.width - 4)
                x -= x + maxWidth - this.#canvas.width + 4

            const dropdownOpacity = 'bb',
                itemOpacityDec = 127,
                itemBackground = Helper.adjustColor(Theme.background, Theme.currentTheme == 0 ? -50 : 50),
                borderColor = Theme.currentTheme == 0 ? '#353535' : '#7e7e7e'

            ctx.beginPath()

            const rect = {
                x: x,
                y: y,
                width: maxWidth,
                height: items.length * 26
                    + dividers.length * 4
                    + (items.length == 1 ? 6 : 0)
                    + (items.length == 2 && dividers.length == 1 ? 6 : 0)
            }

            ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 6)
            ctx.fillStyle = Theme.background + dropdownOpacity
            ctx.strokeStyle = borderColor + dropdownOpacity
            ctx.fill()
            ctx.stroke()

            ctx.beginPath()

            y += 6

            for (const item of this.#options.items) {
                ctx.beginPath()

                if (item.isDivider == true) {
                    y += 2

                    ctx.moveTo(x + 6, y)
                    ctx.lineTo(x + maxWidth - 6, y)

                    ctx.lineWidth = .5
                    ctx.stroke()

                    y += 4

                    continue
                }

                ctx.fillStyle = 'transparent'

                const animationKey = 'animation-dropdown' + item.text

                if (this.#isOnButton(moveEvent, x, y, maxWidth, 20)) {
                    this.animations.add(animationKey,
                        AnimationType.MouseOver,
                        {
                            duration: 300,
                            before: () => {
                                return clickEvent == undefined
                            },
                            body: transition => {
                                this.animations.reload(animationKey, AnimationType.MouseLeave)

                                let opacity = Math.round(itemOpacityDec * transition).toString(16)
                                if (opacity.length == 1)
                                    opacity = '0' + opacity

                                ctx.fillStyle = itemBackground + opacity
                            }
                        })

                    this.#canvas.style.cursor = Styles.Cursor.Pointer

                    if (clickEvent) {
                        item.action()

                        clickEvent = undefined
                        this.isActive = false
                    }
                } else {
                    this.animations.add(animationKey,
                        AnimationType.MouseLeave,
                        {
                            timer: Constants.Dates.minDate,
                            duration: 300,
                            body: transition => {
                                this.animations.reload(animationKey, AnimationType.MouseOver)

                                if (transition == 1)
                                    return

                                let opacity = Math.round(itemOpacityDec * (1 - transition)).toString(16)
                                if (opacity.length == 1)
                                    opacity = '0' + opacity

                                ctx.fillStyle = itemBackground + opacity
                            }
                        })
                }

                ctx.roundRect(x + 6, y, maxWidth - 12, 20, 6)
                ctx.fill()

                ctx.fillStyle = Theme.text
                ctx.textAlign = 'left'
                ctx.textBaseline = 'hanging'
                ctx.fillText(item.text, x + 12, y + 4)

                y += 22
            }
        }

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

        this.#canvasPosition.x += scrollX
        this.#canvasPosition.y += scrollY
    }

    #isOnButton(event: MouseEvent, x: number, y: number, w: number, h: number): boolean {
        if (!event)
            return false

        let trueX = event.clientX - this.#canvasPosition.x + scrollX,
            trueY = event.clientY - this.#canvasPosition.y + scrollY

        return trueX >= x && trueX <= x + w
            && trueY >= y && trueY <= y + h
    }

    refresh() {
        this.#isInit = false
    }

    resize() {
        this.#initAnimations()
    }
}