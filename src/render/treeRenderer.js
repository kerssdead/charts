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

        let x = 0,
            y = 0

        let minX = 0,
            minY = 0

        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        let isVertical = true
        for (let i = 0; i < this.data.values.length; i++) {
            const item = this.data.values[i]

            const remainWidth = this.canvas.width - minX,
                remainHeight = this.canvas.height - minY

            let cells = [
                {
                    color: item.color,
                    label: item.label,
                    s: item.value / sum * totalSquare
                }
            ]

            if (i + 1 <= this.data.values.length - 1) {
                const next = this.data.values[i + 1]

                cells.push({
                    color: next.color,
                    label: next.label,
                    s: next.value / sum * totalSquare
                })

                i++
            }

            const isSingle = cells.length === 1,
                isLast = i === this.data.values.length - 1

            const countMultiplier = this.data.values.length / (this.data.values.length / (this.data.values.length / 10))

            if (isVertical) {
                for (let j = 1; j <= remainWidth + i * i; j++) {
                    const h1 = cells[0].s / j,
                        h2 = isSingle ? 0 : cells[1].s / j

                    if (Math.abs(h1 + h2 - remainHeight) <= i * countMultiplier) {
                    // if (h1 + h2 >= remainHeight) {
                        cells[0].w = j
                        cells[0].h = h1

                        if (!isSingle) {
                            cells[1].w = j
                            cells[1].h = remainHeight - cells[0].h

                            let ew = j,
                                eh = Math.abs(h1 + h2 - remainHeight),
                                es = ew * eh

                            let x = es / (cells[0].h + cells[1].h)

                            // console.log(x)

                            // let ratio = (cells[0].w * cells[0].h) / (cells[1].w * cells[1].h)

                            // console.log(ratio)

                            // let addS1 = es / ratio,
                            //     addS2 = es - addS1

                            // cells[0].w = (cells[0].s + addS1) / cells[0].h
                            // cells[1].w = (cells[1].s + addS2) / cells[1].h

                            cells[0].w += x
                            cells[1].w += x
                        }

                        break
                    }
                }
            } else {
                for (let j = 1; j <= remainHeight + i * i; j++) {
                    const w1 = cells[0].s / j,
                        w2 = isSingle ? 0 : cells[1].s / j

                    // if (Math.abs(w1 + w2 - remainWidth) <= i * countMultiplier) {
                    if (w1 + w2 >= remainWidth) {
                        cells[0].h = j
                        cells[0].w = Math.floor(w1)

                        if (!isSingle) {
                            cells[1].h = j
                            cells[1].w = remainWidth - cells[0].w

                            let ew = j,
                                eh = Math.abs(w1 + w2 - remainWidth),
                                es = ew * eh

                            let x = es / (cells[0].w + cells[1].w)

                            console.log(x)

                            // let ratio = (cells[0].w * cells[0].h) / (cells[1].w * cells[1].h)
                            //
                            // console.log(ratio)
                            //
                            // let addS1 = es / ratio,
                            //     addS2 = es - addS1
                            //
                            // cells[0].h = (cells[0].s + addS1) / cells[0].w
                            // cells[1].h = (cells[1].s + addS2) / cells[1].w

                            cells[0].h += x
                            cells[1].h += x
                        }

                        break
                    }
                }
            }



            for (const cell of cells) {
                // if (isLast) {
                //     if (isVertical) {
                //         cell.w = remainWidth
                //         if (isSingle)
                //             cell.h = remainHeight
                //     } else {
                //         cell.h = remainHeight
                //         if (isSingle)
                //             cell.w = remainWidth
                //     }
                // }

                ctx.fillStyle = cell.color
                ctx.fillRect(x, y, cell.w, cell.h)

                // console.log(x, y, cell.w, cell.h, '|', cell.w * cell.h, cell.s, '|', 'diff', Math.abs(cell.w * cell.h - cell.s))

                if (cell.w <= 0 || cell.h <= 0
                    || isNaN(cell.w) || isNaN(cell.h)) {
                    console.log(i)
                    console.log('count:', this.data.values.length)
                    console.log('isVertical?', isVertical)
                    if (isLast)
                        console.log('last')
                    throw new Error('on render')
                }

                ctx.fillStyle = '#000000'
                ctx.font = '14px serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(cell.label, x + cell.w / 2, y + cell.h / 2)

                if (isVertical)
                    y += cell.h
                else
                    x += cell.w

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

            // console.log(totalSquare, sss)

            if (minX > this.canvas.width
                || minY > this.canvas.height) {
                console.log(i)
                console.log('count:', this.data.values.length)
                console.log('isVertical?', isVertical)
                if (isLast)
                    console.log('last')

                console.log('minX', minX)
                console.log('minY', minY)

                throw new Error('out of bounds')
            }

            isVertical = !isVertical
        }
    }

    destroy() {

    }
}