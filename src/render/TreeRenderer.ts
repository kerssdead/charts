class TreeRenderer extends Renderer<TreeData> {
    #canvasPosition: DOMRect

    #onMouseMoveEvent: MouseEvent

    constructor(node: HTMLElement, settings: ChartSettings) {
        super(node, settings)

        this.data.values.sort((a, b) => b.value > a.value ? 1 : -1)

        const baseColor = settings.baseColor ?? Helper.randomColor()
        let adjustStep = Math.round(100 / this.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        for (let item of this.data.values)
            item.color = Helper.adjustColor(baseColor, adjustAmount += adjustStep)

        this.#initAnimations()
    }

    render() {
        super.render()

        if (this.data.values.filter(v => v.value > 0).length == 0) {
            this.#drawEmpty()
            return
        }

        let titleOffset = this.settings.title ? 50 : 0

        let maxWidth = this.canvas.width - this.data.padding * 2,
            maxHeight = this.canvas.height - this.data.padding * 2 - titleOffset

        let sum = this.data.values.reduce((acc, cur) => acc + cur.value, 0),
            totalSquare = maxWidth * maxHeight

        let x = this.data.padding,
            y = this.data.padding + titleOffset

        let minX = this.data.padding,
            minY = this.data.padding + titleOffset

        let tooltipCell = new TreeCell()

        const ctx = Helpers.Canvas.getContext(this.canvas)

        let isVertical = true
        for (let i = 0; i < this.data.values.length; i++) {
            const item = this.data.values[i]

            const remainWidth = maxWidth - minX + this.data.padding,
                remainHeight = maxHeight - minY + this.data.padding + titleOffset

            let cells: TreeCell[] = [
                {
                    color: item.color,
                    label: item.label,
                    s: item.value / sum * totalSquare,
                    value: item.value,
                    id: item.id,
                    x: x,
                    y: y,
                    w: 0,
                    h: 0
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
                    y: y,
                    w: 0,
                    h: 0
                })

                i++
            }

            const isSingle = cells.length == 1,
                isLast = i == this.data.values.length - 1

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

                ctx.beginPath()

                ctx.fillStyle = cell.color

                const cellInit = this.isInit && !this.animations.contains(cell.id, AnimationType.Init)

                const cellIndex = i + cells.indexOf(cell) + (isLast && isSingle ? 1 : 0),
                    duration = 260

                const getPrev = () => {
                    let acc = 0
                    for (let i = 0; i < cellIndex; i++)
                        acc += duration - duration * (i / this.data.values.length) / Math.E

                    return acc
                }

                const initAnimationDuration = duration - duration * cellIndex / (this.data.values.length + 1)

                if (!cellInit) {
                    this.animations.add(cell.id,
                        AnimationType.Init,
                        {
                            duration: getPrev(),
                            continuous: true,
                            body: transition => {
                                if (transition * getPrev() - getPrev() + initAnimationDuration < 0)
                                    return ctx.fillStyle += '00'

                                transition = (transition * getPrev() - getPrev() + initAnimationDuration) / initAnimationDuration

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
                    if (this.#isInCell(cell)) {
                        tooltipCell = cell

                        this.animations.add(cell.id,
                            AnimationType.MouseOver,
                            {
                                duration: 140,
                                body: transition => {
                                    transition = 1 - transition

                                    const center = {
                                        x: cell.x + cell.w / 2,
                                        y: cell.y + cell.h / 2
                                    }

                                    const minSize = .95,
                                        rest = 1 - minSize

                                    ctx.translate(center.x - center.x * (minSize + transition * rest),
                                        center.y - center.y * (minSize + transition * rest))
                                    ctx.scale(minSize + transition * rest, minSize + transition * rest)

                                    this.animations.reload(cell.id, AnimationType.MouseLeave)
                                }
                            })
                    } else {
                        this.animations.add(cell.id,
                            AnimationType.MouseLeave,
                            {
                                timer: new Date(2000, 1, 1),
                                duration: 140,
                                body: transition => {
                                    const center = {
                                        x: cell.x + cell.w / 2,
                                        y: cell.y + cell.h / 2
                                    }

                                    const minSize = .95,
                                        rest = 1 - minSize

                                    ctx.translate(center.x - center.x * (minSize + transition * rest),
                                        center.y - center.y * (minSize + transition * rest))
                                    ctx.scale((minSize + transition * rest), (minSize + transition * rest))

                                    this.animations.reload(cell.id, AnimationType.MouseOver)
                                }
                            })
                    }
                }

                const gap = 4

                ctx.roundRect(x + gap, y + gap, cell.w - gap, cell.h - gap, gap * 2)
                ctx.fill()

                if (cell.label
                    && Helper.stringWidth(cell.label) < cell.w - gap
                    && cell.h - gap > 16
                    && !this.animations.contains(cell.id, AnimationType.Init)) {
                    ctx.beginPath()
                    Helpers.TextStyles.large(ctx)
                    ctx.fillStyle = !Helper.isColorVisible(cell.color, '#ffffff')
                        ? '#000000'
                        : '#ffffff'
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

        this.tooltip.render(!!tooltipCell,
            this.#onMouseMoveEvent,
            [
                new TooltipValue(`${ tooltipCell?.label }: ${ tooltipCell?.value?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) }`)
            ],
            this.data.values.find(v => v.id == tooltipCell?.id))

        requestAnimationFrame(this.render.bind(this))

        this.isInit = true
    }

    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.#canvasPosition.x += scrollX
        this.#canvasPosition.y += scrollY

        if (!this.isInit)
            this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
    }

    #isInCell(cell: TreeCell) {
        if (!this.#onMouseMoveEvent || !cell)
            return false

        let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x + scrollX,
            y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + scrollY

        return cell.x <= x && x <= cell.x + cell.w
            && cell.y <= y && y <= cell.y + cell.h
    }

    #drawEmpty() {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        Helpers.TextStyles.regular(ctx)
        ctx.fillText('Incorrect values',
            this.canvas.width / 2,
            this.canvas.height / 2)
    }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.#initAnimations()
        this.animations.clear()
    }

    resetMouse() {
        super.resetMouse()

        this.#onMouseMoveEvent = new MouseEvent('mousemove')
    }

    prepareSettings() {
        this.data.values.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

        super.prepareSettings()

        for (let item of this.data.values) {
            item.disabled = !item.value
            item.value ??= 0
        }
    }
}