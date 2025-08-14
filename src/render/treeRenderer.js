class OTreeRenderer extends ORenderer {
    /**
     * @type {OTreeData}
     */
    data

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {MouseEvent}
     */
    #onMouseMoveEvent

    /**
     * @type {MouseEvent}
     */
    #onClickEvent

    /**
     * @type {boolean}
     */
    #isInit

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = chart.data

        this.data.values.sort((a, b) => b.value - a.value)

        this.#initAnimations()
    }

    render() {
        super.render()

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
                    value: item.value,
                    id: item.id,
                    x: x,
                    y: y
                }
            ]

            if (i + 1 <= this.data.values.length - 1) {
                const next = this.data.values[i + 1]

                cells.push({
                    color: next.color,
                    label: next.label,
                    s: next.value / sum * totalSquare,
                    value: next.value,
                    id: next.id,
                    x: x,
                    y: y
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

                            cells[1].y += cells[0].h
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

                            cells[1].x += cells[0].w
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

                const groupInited = this.#isInit && !this.animations.contains({ id: cell.id }, OAnimationTypes.init)

                if (!groupInited) {
                    this.animations.add({ id: cell.id },
                        OAnimationTypes.init,
                        {
                            timer: null,
                            duration: 125 + (this.chart.data.values.indexOf(item) + 1) / this.chart.data.values.length * 175,
                            before: (item, passed, duration) => {
                                return passed <= duration
                            },
                            body: (passed, duration) => {
                                if (passed > duration)
                                    duration = passed

                                const transition = passed / duration

                                const center = {
                                    x: cell.x + cell.w / 2,
                                    y: cell.y + cell.h / 2
                                }

                                const minSize = .7,
                                    rest = 1 - minSize

                                ctx.translate(center.x - center.x * (minSize + transition * rest),
                                    center.y - center.y * (minSize + transition * rest))
                                ctx.scale((minSize + transition * rest), (minSize + transition * rest))

                                let opacity = Math.round(255 * transition).toString(16)

                                if (opacity.length < 2)
                                    opacity = 0 + opacity

                                ctx.fillStyle = cell.color + opacity
                            }
                        })
                } else {
                    this.animations.add({ id: cell.id },
                        OAnimationTypes.mouseover,
                        {
                            timer: null,
                            duration: 140,
                            before: () => {
                                return this.#isInCell(cell)
                            },
                            body: (passed, duration) => {
                                if (passed > duration)
                                    passed = duration

                                const transition = 1 - passed / duration

                                const center = {
                                    x: cell.x + cell.w / 2,
                                    y: cell.y + cell.h / 2
                                }

                                const minSize = .9,
                                    rest = 1 - minSize

                                ctx.translate(center.x - center.x * (minSize + transition * rest),
                                    center.y - center.y * (minSize + transition * rest))
                                ctx.scale((minSize + transition * rest), (minSize + transition * rest))

                                this.animations.reload({ id: cell.id }, OAnimationTypes.mouseleave)
                            }
                        })

                    this.animations.add({ id: cell.id },
                        OAnimationTypes.mouseleave,
                        {
                            timer: new Date(2000, 1, 1),
                            duration: 140,
                            before: () => {
                                return !this.#isInCell(cell)
                            },
                            body: (passed, duration) => {
                                if (passed > duration)
                                    passed = duration

                                const transition = passed / duration

                                const center = {
                                    x: cell.x + cell.w / 2,
                                    y: cell.y + cell.h / 2
                                }

                                const minSize = .9,
                                    rest = 1 - minSize

                                ctx.translate(center.x - center.x * (minSize + transition * rest),
                                    center.y - center.y * (minSize + transition * rest))
                                ctx.scale((minSize + transition * rest), (minSize + transition * rest))
                            }
                        })
                }

                ctx.fillRect(x, y, cell.w, cell.h)

                if (cell.label && OHelper.stringWidth(cell.label) < cell.w) {
                    ctx.fillStyle = '#000000'
                    ctx.font = '14px serif'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(cell.label, x + cell.w / 2, y + cell.h / 2)
                }

                ctx.resetTransform()

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

        requestAnimationFrame(this.render.bind(this))

        this.#isInit = true
    }

    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY

        this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
        this.canvas.onclick = event => this.#onClickEvent = event
    }

    /**
     * @param cell {OTreeCell}
     */
    #isInCell(cell) {
        if (!this.#onMouseMoveEvent)
            return false

        let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + window.scrollX,
            y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

        return cell.x <= x && x <= cell.x + cell.w
            && cell.y <= y && y <= cell.y + cell.h
    }

    destroy() {

    }
}