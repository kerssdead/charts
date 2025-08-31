import { OHelper } from '/src/helper.js'

export class OTooltip {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {OData}
     */
    data

    /**
     * @type {boolean}
     */
    #enabled

    /**
     * @type {boolean}
     */
    #isCustom

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {HTMLTemplateElement}
     */
    #template

    /**
     * @param canvas {HTMLCanvasElement}
     * @param settings {OChartSettings}
     */
    constructor(canvas, settings) {
        this.canvas = canvas
        this.data = settings.data
        this.#enabled = settings.enableTooltip
        this.#isCustom = !!settings.templateId

        if (this.#isCustom)
            this.#template = document.getElementById(settings.templateId)

        this.refresh()
    }

    /**
     * @param condition {boolean}
     * @param event {MouseEvent}
     * @param text {string}
     * @param value {OBasePoint?}
     */
    render(condition, event, text, value) {
        if (!this.#enabled || !event)
            return

        if (condition) {
            if (this.#isCustom)
                this.#renderCustom(event, value)
            else
                this.#renderRegular(event, text)
        } else {
            this.#hideAll()
        }
    }

    /**
     * @param event {MouseEvent}
     * @param text {string}
     */
    #renderRegular(event, text) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const split = text.split('\n').filter(line => !!line)

        const textWidth = Math.max(...split.map(line => OHelper.stringWidth(line)))

        let x = event.clientX - this.#canvasPosition.x + 10,
            y = event.clientY - this.#canvasPosition.y + window.scrollY + 10

        if (x + textWidth + 16 > this.#canvasPosition.width)
            x = this.#canvasPosition.width - (textWidth + 16)

        if (y + 10 + split.length * 18 > this.#canvasPosition.height)
            y = this.#canvasPosition.height - 10 - split.length * 18

        ctx.beginPath()
        ctx.roundRect(x, y, textWidth + 16, 16 + 16 * split.length, 20)
        ctx.fillStyle = '#00000077'
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

    /**
     * @param event {MouseEvent}
     * @param value {OBasePoint}
     */
    #renderCustom(event, value) {
        const id = this.#template.id + value.id

        let tooltip = document.getElementById(id)

        const updateVisibility = () => {
            this.#hideAll()

            tooltip.style.visibility = 'visible'
        }

        if (!tooltip) {
            const regex = /\${[^}]*}/gm

            let content = this.#template.cloneNode(true)

            tooltip = document.createElement('div')

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

        let x = event.clientX + 10,
            y = event.clientY + 10

        tooltip.style.left = x + 'px'
        tooltip.style.top = y + 'px'
    }

    refresh() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()
        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY
    }

    #hideAll() {
        if (!this.#isCustom)
            return

        const tooltips = document.querySelectorAll(`[name="${ this.#template.id }"]`)

        for (let node of tooltips)
            node.style.visibility = 'hidden'
    }

    destroy() {

    }
}