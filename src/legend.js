class Legend {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {CircularData}
     */
    data

    /**
     * @param chart {Chart}
     * @param data {CircularData}
     */
    constructor(chart, data) {
        this.data = data

        this.canvas = document.createElement('canvas')

        this.canvas.width = 1600
        this.canvas.height = 200

        chart.node.append(this.canvas)
    }

    render() {
        const ctx = this.canvas.getContext('2d')

        let x = 20,
            y = 20

        for (const value of this.data.values) {
            if (x + 50 + value.label.width(18) >= this.canvas.width) {
                x = 20
                y += 38
            }

            ctx.beginPath()

            ctx.arc(x, y, 10, 0, 2 * Math.PI)
            ctx.fillStyle = value.color
            ctx.fill()

            ctx.fillStyle = '#000000'
            ctx.font = '18px serif'
            ctx.fillText(value.label, x += 20, y + 4)

            x += value.label.width(18) + 45
        }
    }

    destroy() {

    }
}