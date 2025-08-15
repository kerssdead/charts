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
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @param canvas {HTMLCanvasElement}
     * @param settings {OChartSettings}
     */
    constructor(canvas, settings) {
        this.canvas = canvas
        this.data = settings.data
        this.#enabled = settings.enableTooltip

        this.refresh()
    }

    /**
     * @param event {MouseEvent}
     * @param text {string}
     * @param id {string?}
     */
    render(event, text, id) {
        console.log(event)

        if (!this.#enabled || !event)
            return

        if (id)
            this.#renderCustom(event, id)
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

        let x = event.clientX - this.#canvasPosition.x,
            y = event.clientY - this.#canvasPosition.y + window.scrollY

        ctx.beginPath()
        ctx.roundRect(x += 10, y += 10, textWidth + 16, 34, 20)
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
     * @param id {string}
     */
    #renderCustom(event, id) {

    }

    refresh() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()
        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY
    }

    destroy() {

    }
}