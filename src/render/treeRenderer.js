class OTreeRenderer extends ORenderer {
    /**
     * @type {OTreeData}
     */
    data

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = chart.data

        this.data.values.sort((a, b) => b.value - a.value)
    }

    render() {
        let sum = this.data.values.reduce((acc, cur) => acc + cur.value, 0),
            totalSquare = this.canvas.width * this.canvas.height

        let w = Math.round(Math.sqrt(this.data.values[0].value / sum * totalSquare)),
            h = w

        let x = 0,
            y = 0

        let minX = 0,
            minY = 0

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        let isVertical = true

        for (let i = 0; i < this.data.values.length; i++) {
            const item = this.data.values[i]

            const target = Math.round(item.value / sum * totalSquare)

            if (isVertical) {
                w = this.canvas.width / 2
                h = this.canvas.height / 4
            }

            let cells = [
                {
                    w: w,
                    h: h,
                    color: item.color,
                    label: item.label,
                    s: target
                }
            ]

            if (i + 1 <= this.data.values.length - 1) {
                const next = this.data.values[i + 1]

                cells.push({
                    w: w,
                    h: this.canvas.height - h,
                    color: next.color,
                    label: next.label,
                    s: Math.round(next.value / sum * totalSquare)
                })

                i++
            }

            let counter = 0

            const isSingle = cells.length === 1,
                isLast = i === this.data.values.length - 1

            const precision = 1000

            while (Math.abs(cells[0].w * cells[0].h - cells[0].s) >= precision
                || (!isSingle && Math.abs(cells[1].w * cells[1].h - cells[1].s) >= precision)
                || (isSingle ? cells[0].h : cells[0].h + cells[1].h) > this.canvas.height
                || (isSingle ? cells[0].h : cells[0].h + cells[1].h) < this.canvas.height) {
                const moreWidth = () => {
                    if ((isSingle ? cells[0].h : cells[0].h + cells[1].h) > this.canvas.height) {
                        cells[0].w++
                        if (!isSingle)
                            cells[1].w++
                    }
                }
                const lessWidth = () => {
                    if ((isSingle ? cells[0].h : cells[0].h + cells[1].h) < this.canvas.height) {
                        cells[0].w--
                        if (!isSingle)
                            cells[1].w--
                    }
                }

                moreWidth()
                lessWidth()

                if (!isSingle
                    && Math.abs(cells[0].w * cells[0].h - cells[0].s) >= precision
                    && Math.abs(cells[1].w * cells[1].h - cells[1].s) >= precision
                    && cells[0].h + cells[1].h > this.canvas.height) {
                    cells[1].h = this.canvas.height - cells[0].h
                }

                const s0 = cells[0].w * cells[0].h,
                    s1 = !isSingle ? cells[1].w * cells[1].h : 0

                if (Math.abs(s0 - cells[0].s) >= precision) {
                    if (s0 > cells[0].s) {
                        cells[0].h--
                    } else {
                        cells[0].h++
                    }
                }

                if (!isSingle) {
                    if (Math.abs(s1 - cells[1].s) >= precision) {
                        if (s1 > cells[1].s) {
                            cells[1].h--
                        } else {
                            cells[1].h++
                        }
                    }
                }

                if (isSingle && cells[0].h > this.canvas.height) {
                    cells[0].w += cells[0].h - this.canvas.height
                    cells[0].h = this.canvas.height
                }

                if (!isSingle && cells[0].h + cells[1].h < this.canvas.height) {
                    cells[0].h++

                    cells[0].w--
                    cells[1].w--
                }

                counter++

                if (counter > this.canvas.width + this.canvas.height)
                    throw new Error('invalid values')
            }

            if (isLast && isSingle) {
                cells[0].w = this.canvas.width - minX
                cells[0].h = this.canvas.height - minY
            }

            for (const cell of cells) {
                ctx.fillStyle = cell.color
                ctx.fillRect(x, y, cell.w, cell.h)

                ctx.fillStyle = '#000000'
                ctx.font = '14px serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(cell.label, x + cell.w / 2, y + cell.h / 2)

                y += cell.h
            }

            x += cells[0].w

            if (isVertical)
                y += h
            else
                x += w

            if (x > this.canvas.width) {
                minY = y
                y = minY
                x = minX
            }

            if (y > this.canvas.height) {
                minX = x
                x = minX
                y = minY
            }

            // isVertical = !isVertical
        }
    }

    /**
     * @param a {number}
     * @param b {number}
     */
    #isCloseToASquare(a, b) {

    }

    destroy() {

    }
}