class OTooltip {
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
     * @param event {MouseEvent}
     * @param text {string}
     * @param value {OBasePoint?}
     */
    render(event, text, value) {
        if (!this.#enabled || !event)
            return

        if (this.#isCustom)
            this.#renderCustom(event, value)
        else
            this.#renderRegular(event, text)
    }

    /**
     * @param event {MouseEvent}
     * @param text {string}
     */
    #renderRegular(event, text) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const textWidth = OHelper.stringWidth(text)

        let x = event.clientX - this.#canvasPosition.x + 10,
            y = event.clientY - this.#canvasPosition.y + window.scrollY + 10

        if (x + textWidth + 16 > this.#canvasPosition.width)
            x = this.#canvasPosition.width - (textWidth + 16)

        if (y + 34 > this.#canvasPosition.height)
            y = this.#canvasPosition.height - 34

        ctx.beginPath()
        ctx.roundRect(x, y, textWidth + 16, 34, 20)
        ctx.fillStyle = '#00000077'
        ctx.shadowColor = '#00000077'
        ctx.shadowBlur = 20
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = '14px serif'
        ctx.textAlign = 'start'
        ctx.fillText(text, x + 12, y + 22)
    }

    /**
     * @param event {MouseEvent}
     * @param value {OBasePoint}
     */
    #renderCustom(event, value) {
        const id = this.#template.id + value.id

        let tooltip = document.getElementById(id)

        const updateVisibility = () => {
            const tooltips = document.querySelectorAll(`[name="${ this.#template.id }"]`)

            for (let node of tooltips)
                node.style.visibility = 'hidden'

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

    destroy() {

    }
}