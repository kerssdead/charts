class Tooltip {
    canvas: HTMLCanvasElement

    data: Data

    readonly #enabled: boolean

    readonly #isCustom: boolean

    #canvasPosition: DOMRect

    #template: HTMLTemplateElement

    #inProgress: boolean

    #toHide: boolean

    #timer: Date | undefined

    #animationDuration: number = 120

    constructor(canvas: HTMLCanvasElement, settings: ChartSettings) {
        this.canvas = canvas
        this.data = settings.data
        this.#enabled = settings.enableTooltip
        this.#isCustom = !!settings.templateId

        if (this.#isCustom)
            this.#template = <HTMLTemplateElement>document.getElementById(settings.templateId)

        this.refresh()
    }

    render(condition: boolean, event: MouseEvent, text: string, value?: BasePoint) {
        this.#hideAll()

        if (!this.#enabled || !event)
            return

        if (condition || this.#inProgress || this.#toHide) {
            if (!this.#timer)
                this.#timer = new Date()

            if (!this.#toHide)
                this.#inProgress = true
            else if (this.#inProgress)
                this.#timer = new Date()

            if (this.#isCustom)
                this.#renderCustom(event, value)
            else
                this.#renderRegular(event, text)

            const opacityValue = this.#getOpacityValue()

            if (this.#toHide && opacityValue >= 1) {
                this.#inProgress = false
                this.#toHide = false
            }

            if (this.#toHide && opacityValue <= 0) {
                this.#inProgress = false
                this.#toHide = false
                this.#timer = undefined
            }

            if (!condition && this.#timer != undefined)
                this.#toHide = true
        } else {
            this.#timer = undefined
        }
    }

    #renderRegular(event: MouseEvent, text: string) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx)
            throw Helpers.Errors.nullContext

        const split = text.split('\n').filter(line => !!line)

        const textWidth = Math.max(...split.map(line => Helper.stringWidth(line)))

        let x = event.clientX - this.#canvasPosition.x + 10,
            y = event.clientY - this.#canvasPosition.y + window.scrollY + 10

        if (x + textWidth + 16 > this.#canvasPosition.width)
            x = this.#canvasPosition.width - (textWidth + 16)

        if (y + 10 + split.length * 18 > this.#canvasPosition.height)
            y = this.#canvasPosition.height - 10 - split.length * 18

        ctx.beginPath()
        ctx.roundRect(x, y, textWidth + 16, 16 + 16 * split.length, 20)
        let opacity = Math.round(this.#getOpacityValue() * 77).toString(16)
        if (opacity.length == 1)
            opacity = '0' + opacity
        ctx.fillStyle = '#000000' + opacity
        ctx.fill()

        for (let line of split) {
            ctx.fillStyle = '#ffffff'
            ctx.font = '14px serif'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'alphabetic'
            ctx.fillText(line, x + 12, y + 22)

            y += 16
        }
    }

    #renderCustom(event: MouseEvent, value?: BasePoint) {
        if (value === undefined)
            return

        const id = this.#template.id + value.id

        let tooltip = <HTMLTooltipElement>document.getElementById(id)

        const updateVisibility = () => {
            this.#hideAll()

            tooltip.style.visibility = 'visible'
        }

        if (!tooltip) {
            const regex = /\${[^}]*}/gm

            let content = <HTMLElement>this.#template.cloneNode(true)

            tooltip = <HTMLTooltipElement>document.createElement('div')

            tooltip.innerHTML = content.innerHTML

            tooltip.id = id
            tooltip.style.position = 'absolute'
            tooltip.style.pointerEvents = 'none'
            tooltip.style.visibility = 'visible'

            tooltip.setAttribute('name', this.#template.id)

            const matches = [...tooltip.innerHTML.matchAll(regex)]

            let html = tooltip.innerHTML

            for (const match of matches) {
                const property = match[0].replace('${', '')
                    .replace('}', '')
                    .replaceAll(' ', '')

                html = html.replaceAll(match[0], value.data[property])
            }

            tooltip.innerHTML = html

            document.body.appendChild(tooltip)

            tooltip.position = tooltip.getBoundingClientRect()

            updateVisibility()
        }

        if (tooltip.style.visibility === 'hidden')
            updateVisibility()

        if (tooltip.position.height === 0)
            tooltip.position = tooltip.getBoundingClientRect()

        const offset = 10

        let x = event.clientX,
            y = event.clientY + window.scrollY

        if (x + tooltip.position.width - this.#canvasPosition.x > this.#canvasPosition.width - offset)
            x = this.#canvasPosition.width - tooltip.position.width + this.#canvasPosition.x - offset

        if (y + tooltip.position.height - this.#canvasPosition.y > this.#canvasPosition.height - offset)
            y = this.#canvasPosition.height - tooltip.position.height + this.#canvasPosition.y - offset

        tooltip.style.left = x + offset + 'px'
        tooltip.style.top = y + offset + 'px'
    }

    refresh() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()
        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY
    }

    #hideAll() {
        if (!this.#isCustom)
            return

        const tooltips = <NodeListOf<HTMLElement>>document.querySelectorAll(`[name="${ this.#template.id }"]`)

        for (let node of tooltips)
            node.style.visibility = 'hidden'
    }

    #getOpacityValue(): number {
        if (!this.#timer)
            return 0

        let opacityValue = this.#toHide
            ? 1 - (new Date().getTime() - this.#timer.getTime()) / this.#animationDuration
            : (new Date().getTime() - this.#timer.getTime()) / this.#animationDuration
        if (opacityValue > 1)
            opacityValue = 1
        if (opacityValue < 0)
            opacityValue = 0

        return opacityValue
    }
}