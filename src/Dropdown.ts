class Dropdown {
    #canvas: HTMLCanvasElement

    #options: DropdownOptions

    #canvasPosition: DOMRect

    animations: Animations

    isActive: boolean = false

    #isInit: boolean

    constructor(canvas: HTMLCanvasElement, options: DropdownOptions) {
        this.#canvas = canvas
        this.#options = options

        this.animations = new Animations()

        this.#initAnimations()
    }

    render(moveEvent: MouseEvent, clickEvent: MouseEvent | undefined) {
        if (!this.#isInit)
            this.#initAnimations()

        let ctx = this.#canvas.getContext('2d', {willReadFrequently: true})

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

            if (clickEvent && moveEvent.x === clickEvent.x && moveEvent.y === clickEvent.y) {
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

                            ctx.fillStyle = Helper.adjustColor('#ffffff', -Math.round(40 * transition))
                        }
                    })
            else
                ctx.fillStyle = Helper.adjustColor('#ffffff', -40)
        } else {
            this.#canvas.style.cursor = 'default'

            if (!this.isActive)
                this.animations.add('animation-dropdown',
                    AnimationType.MouseLeave,
                    {
                        duration: 300,
                        body: transition => {
                            this.animations.reload('animation-dropdown', AnimationType.MouseOver)

                            ctx.fillStyle = Helper.adjustColor('#ffffff', -Math.round((1 - transition) * 40))
                        }
                    })
            else
                ctx.fillStyle = Helper.adjustColor('#ffffff', -40)
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

            let maxWidth = Math.max(...this.#options.items.map(value => Helper.stringWidth(value.text))) + 8

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
                    this.animations.add('animation-dropdown' + item.text,
                        AnimationType.MouseOver,
                        {
                            duration: 300,
                            before: () => {
                                return clickEvent === undefined
                            },
                            body: transition => {
                                this.animations.reload('animation-dropdown' + item.text, AnimationType.MouseLeave)

                                ctx.fillStyle = Helper.adjustColor('#ffffff', 60 - Math.round(transition * 100))
                            }
                        })

                    this.#canvas.style.cursor = 'pointer'

                    if (clickEvent) {
                        item.action()

                        clickEvent = undefined
                        this.isActive = false
                    }
                } else {
                    this.animations.add('animation-dropdown' + item.text,
                        AnimationType.MouseLeave,
                        {
                            duration: 300,
                            body: transition => {
                                this.animations.reload('animation-dropdown', AnimationType.MouseOver)

                                ctx.fillStyle = Helper.adjustColor('#ffffff', 60 - Math.round((1 - transition) * 100))
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

    #isOnButton(event: MouseEvent, x: number, y: number, w: number, h: number): boolean {
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