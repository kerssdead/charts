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
        let maxWidth = this.canvas.width,
            maxHeight = this.canvas.height

        let sum = this.data.values.reduce((acc, cur) => acc + cur.value, 0),
            totalSquare = maxWidth * maxHeight

        let x = 0,
            y = 0

        let minX = 0,
            minY = 0

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        let isVertical = true
        for (let i = 0; i < this.data.values.length; i++) {
            const item = this.data.values[i]

            const remainWidth = maxWidth - minX,
                remainHeight = maxHeight - minY

            let cells = [
                {
                    color: item.color,
                    label: item.label,
                    s: item.value / sum * totalSquare,
                    value: item.value
                }
            ]

            if (i + 1 <= this.data.values.length - 1) {
                const next = this.data.values[i + 1]

                cells.push({
                    color: next.color,
                    label: next.label,
                    s: next.value / sum * totalSquare,
                    value: next.value
                })

                i++
            }

            const isSingle = cells.length === 1,
                isLast = i === this.data.values.length - 1

            if (isVertical) {
                for (let j = 1; j <= remainWidth + i * i; j++) {
                    const w = remainWidth - j,
                        h1 = cells[0].s / w,
                        h2 = isSingle ? 0 : cells[1].s / w

                    if (h1 + h2 >= remainHeight) {
                        cells[0].w = Math.floor(w)
                        cells[0].h = Math.floor(h1)

                        if (!isSingle) {
                            cells[1].w = Math.floor(w)
                            cells[1].h = remainHeight - cells[0].h
                        }

                        break
                    }
                }
            } else {
                for (let j = 1; j <= remainHeight + i * i; j++) {
                    const h = remainHeight - j,
                        w1 = cells[0].s / h,
                        w2 = isSingle ? 0 : cells[1].s / h

                    if (w1 + w2 >= remainWidth) {
                        cells[0].h = Math.floor(h)
                        cells[0].w = Math.floor(w1)

                        if (!isSingle) {
                            cells[1].h = Math.floor(h)
                            cells[1].w = remainWidth - cells[0].w
                        }

                        break
                    }
                }
            }

            for (const cell of cells) {
                if (isLast) {
                    if (isVertical) {
                        cell.w = remainWidth
                        if (isSingle)
                            cell.h = remainHeight
                    } else {
                        cell.h = remainHeight
                        if (isSingle)
                            cell.w = remainWidth
                    }
                }

                ctx.fillStyle = cell.color
                ctx.fillRect(x, y, cell.w, cell.h)

                if (cell.label && OHelper.stringWidth(cell.label) < cell.w) {
                    ctx.fillStyle = '#000000'
                    ctx.font = '14px serif'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(cell.label, x + cell.w / 2, y + cell.h / 2)
                }

                if (isVertical)
                    y += cell.h
                else
                    x += cell.w

                totalSquare -= cell.w * cell.h
                sum -= cell.value
            }

            if (isVertical) {
                x += cells[0].w
                y = minY
            } else {
                y += cells[0].h
                x = minX
            }

            minX = x
            minY = y

            isVertical = !isVertical
        }
    }

    destroy() {

    }
}