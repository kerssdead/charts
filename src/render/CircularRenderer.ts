///<reference path="../types/base/Renderer.ts"/>
class CircularRenderer extends Renderer<CircularData> {
    #canRenderInnerTitle: boolean

    #isDonut: boolean

    #radius: number

    #sum: number

    #accumulator: number

    #animationOffset: number

    #currentHover: string | undefined

    #pinned: string[]

    #center: Point

    #startPoint: Point

    #angles: CircularAngle[]

    #other: Sector[]

    #innerTitleStyle: Function

    readonly #startAngle: number

    constructor(node: HTMLElement, settings: ChartSettings) {
        super(node, settings)

        this.data.values = this.data.values.map(v => new Sector(v))

        if (this.settings.enableOther) {
            if (!this.settings.contextMenu)
                this.settings.contextMenu = [] as DropdownItem[]
            else
                this.settings.contextMenu.push({
                    isDivider: true
                } as DropdownItem)

            this.settings.contextMenu.push({
                    text: TextResources.Show,
                    condition: data => data?._other,
                    action: () => {
                        new Modal(Decomposition.toChart<Sector>(this.settings, this.#other),
                            {
                                width: window.innerWidth * .8,
                                height: window.innerHeight * .8
                            } as DOMRect)
                            .open()
                    }
                })
        }

        this.#startAngle = Math.random() % (Math.PI * 2)

        this.#pinned = []

        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove)
    }

    render() {
        super.render()

        this.#accumulator = this.#startAngle
        this.#currentHover = undefined

        if (this.data.values.filter(v => !v.disabled).length == 0)
            this.#drawEmpty()
        else
            this.#draw()

        this.isInit = true

        super.renderDropdown()

        if (this.#currentHover || this.contextMenu)
            this.renderContextMenu(this.data.values.find(v => v.id == this.#currentHover)?.data ?? {})
        else
            this.onContextMenuEvent = undefined

        if (this.#currentHover)
            this.canvas.style.cursor = Styles.Cursor.Pointer
    }

    #draw() {
        if (this.onMouseMoveEvent || !this.isInit) {
            this.#sum = this.data.values.reduce((acc, v) => acc + v.current, 0)

            let anglesSum = this.#startAngle
            this.#angles = this.data.values.flatMap(sector => {
                                   const angle = sector.current / this.#sum * 2 * Math.PI

                                   return {
                                       id: sector.id,
                                       value: angle,
                                       sum: (anglesSum += angle) - angle
                                   }
                               })
                               .reverse()

            this.#startPoint = this.#getPoint(this.#radius, 0)

            for (const value of this.data.values)
                this.#drawSector(value)

            const value = this.data.values.find(v => v.id == this.#currentHover)
            this.tooltip.render(!!value && !this.dropdown?.isActive,
                this.onMouseMoveEvent,
                [
                    new TooltipValue(`${ value?.label }: ${ Helpers.Formatter.number(value?.current) }`)
                ])

            this.#drawInnerTitle()
        }

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))
    }

    #drawSector(value: Sector) {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        ctx.fillStyle = value.color
        ctx.strokeStyle = value.color

        const piece = value.current / this.#sum,
            angle = (isNaN(piece) ? 1 : piece) * 2 * Math.PI

        const isSingle = this.data.values.filter(s => !s.disabled).length == 1

        if ((!!this.onClickEvent || this.#pinned.includes(value.id))
            && !this.animations.contains(value.id, AnimationType.Init)
            && !isSingle) {
            this.animations.add(value.id,
                AnimationType.Click,
                {
                    duration: Constants.Animations.circular,
                    before: () => {
                        if (!!this.onClickEvent) {
                            if (this.#isInsideSector(this.onClickEvent, value)) {
                                if (this.#pinned.includes(value.id))
                                    this.#pinned = this.#pinned.filter(id => id != value.id)
                                else
                                    this.#pinned.push(value.id)

                                this.onClickEvent = new PointerEvent(Events.Click)
                            }
                        }

                        return true
                    },
                    body: () => {
                        if (!this.#pinned.includes(value.id))
                            return

                        let direction = this.#accumulator + angle / 2

                        const transition = {
                            x: this.#animationOffset * Math.cos(direction),
                            y: this.#animationOffset * Math.sin(direction)
                        }

                        ctx.translate(transition.x, transition.y)

                        ctx.fillStyle = value.color
                    }
                })
        }

        if (this.onMouseMoveEvent && this.#isInsideSector(this.onMouseMoveEvent, value))
            this.#currentHover = value.id

        if (!this.isInit || this.animations.contains(value.id, AnimationType.Init)) {
            this.animations.add(value.id,
                AnimationType.Init,
                {
                    duration: Constants.Animations.circular + (this.data.values.indexOf(value) + 1) / this.data.values.length * Constants.Animations.circular,
                    continuous: true,
                    body: transition => {
                        const centerOfSector = {
                            x: this.#center.x + this.#radius / 2 * Math.cos(this.#accumulator + angle / 2),
                            y: this.#center.y + this.#radius / 2 * Math.sin(this.#accumulator + angle / 2)
                        }

                        const minSize = .7,
                            rest = 1 - minSize

                        ctx.translate(centerOfSector.x - centerOfSector.x * (minSize + transition * rest),
                            centerOfSector.y - centerOfSector.y * (minSize + transition * rest))
                        ctx.scale((minSize + transition * rest), (minSize + transition * rest))

                        let opacity = Math.round(255 * transition).toString(16)

                        if (opacity.length < 2)
                            opacity = 0 + opacity

                        ctx.fillStyle = value.color + opacity
                        ctx.strokeStyle = value.color + opacity
                    }
                })
        } else if (this.onMouseMoveEvent
                   && !this.animations.contains(value.id, AnimationType.Init)
                   && !this.#pinned.includes(value.id)
                   && !isSingle) {
            const translate = (transition: number, event: AnimationType, swap: boolean) => {
                this.animations.reload(value.id, event)

                if (transition == 0)
                    return

                if (swap)
                    transition = value.transition

                const direction = this.#accumulator + angle / 2,
                    translate = {
                        x: this.#animationOffset * Math.cos(direction) * transition,
                        y: this.#animationOffset * Math.sin(direction) * transition
                    }

                ctx.translate(translate.x, translate.y)

                value.translate = translate
                value.transition = transition

                ctx.fillStyle = Helper.adjustColor(value.color, Math.round(33 * transition))
                ctx.strokeStyle = Helper.adjustColor(value.color, Math.round(33 * transition))
            }

            if (!this.#isInsideSector(this.onMouseMoveEvent, value)
                || !this.animations.contains(value.id, AnimationType.MouseLeave))
                this.animations.add(value.id,
                    AnimationType.MouseLeave,
                    {
                        timer: Constants.Dates.minDate,
                        duration: Constants.Animations.circular,
                        backward: true,
                        body: transition => {
                            translate(transition,
                                AnimationType.MouseOver,
                                value.transition < transition)
                        }
                    })
            else
                this.animations.add(value.id,
                    AnimationType.MouseOver,
                    {
                        duration: Constants.Animations.circular,
                        body: transition => {
                            translate(transition,
                                AnimationType.MouseLeave,
                                value.transition > transition)
                        }
                    })
        }

        let point2 = this.#getPoint(this.#radius, angle)

        if (angle > 0) {
            ctx.save()

            if (value.current > 0) {
                let labelStartPoint = this.#getPoint(this.#radius + 10, angle / 2),
                    labelMidPoint = this.#getPoint(this.#radius + 20, angle / 2)

                const dir = labelStartPoint.x > this.#center.x ? 1 : -1

                let endPoint = {
                    x: labelMidPoint.x + 10 * dir,
                    y: labelMidPoint.y
                }

                let isBusy = false

                const textWidth = Helper.stringWidth(value.label),
                    imageDataX = dir == 1 ? endPoint.x + 8 : endPoint.x - textWidth - 8,
                    imageData = new Uint32Array(ctx.getImageData(imageDataX, endPoint.y - 12, textWidth, 24).data.buffer)

                if (imageDataX < 0 || imageDataX + textWidth > this.canvas.width
                    || endPoint.y - 12 < 0 || endPoint.y + 12 > this.canvas.height)
                    isBusy = true

                if (!isBusy)
                    for (let i = 0; i < imageData.length; i++)
                        if (Helpers.Canvas.isPixelBusy(imageData[i])) {
                            isBusy = true
                            break
                        }

                if (!isBusy) {
                    ctx.beginPath()
                    ctx.moveTo(labelStartPoint.x, labelStartPoint.y)

                    ctx.quadraticCurveTo(labelMidPoint.x, labelMidPoint.y, endPoint.x, endPoint.y)

                    let opacity = Math.round(255 * (value.current / value.value)).toString(16)

                    if (opacity.length < 2)
                        opacity = 0 + opacity

                    ctx.strokeStyle = Theme.text + opacity
                    ctx.stroke()

                    ctx.fillStyle = Theme.text + opacity
                    Helpers.TextStyles.circularLabel(ctx, dir == 1)
                    ctx.fillText(value.label, endPoint.x + 8 * dir, endPoint.y + 4)
                }
            }

            ctx.restore()

            ctx.beginPath()

            if (!this.#isDonut)
                ctx.moveTo(this.#center.x, this.#center.y)

            ctx.lineTo(this.#startPoint.x, this.#startPoint.y)

            let localAccumulator = 0,
                localAngle = angle

            while (localAngle > 0) {
                let currentAngle = localAngle - Math.PI / 6 > 0
                                   ? Math.PI / 6
                                   : localAngle

                point2 = this.#getPoint(this.#radius, localAccumulator + currentAngle)

                const tangentIntersectionAngle = Math.PI - currentAngle,
                    lengthToTangentIntersection = this.#radius / Math.sin(tangentIntersectionAngle / 2),
                    tangentIntersectionPoint = this.#getPoint(lengthToTangentIntersection, localAccumulator + currentAngle / 2)

                ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

                localAccumulator += currentAngle

                localAngle -= Math.PI / 6
            }

            if (this.#isDonut || value.innerRadius != 0) {
                const innerRadius = this.#radius * (value.innerRadius / 100)

                const innerPoint2 = {
                    x: point2.x - (((this.#radius - innerRadius) * (point2.x - this.#center.x)) / this.#radius),
                    y: point2.y - (((this.#radius - innerRadius) * (point2.y - this.#center.y)) / this.#radius)
                }

                ctx.lineTo(innerPoint2.x, innerPoint2.y)

                localAngle = 0
                localAccumulator = angle

                while (localAngle < angle) {
                    let currentAngle = localAngle + Math.PI / 6 < angle
                                       ? Math.PI / 6
                                       : angle - localAngle

                    point2 = this.#getPoint(innerRadius, localAccumulator - currentAngle)

                    const tangentIntersectionAngle = Math.PI - currentAngle,
                        lengthToTangentIntersection = innerRadius / Math.sin(tangentIntersectionAngle / 2),
                        tangentIntersectionPoint = this.#getPoint(lengthToTangentIntersection, localAccumulator - currentAngle / 2)

                    ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

                    localAccumulator -= currentAngle

                    localAngle += Math.PI / 6
                }

                point2 = this.#getPoint(this.#radius, angle)
            }

            ctx.fill()
            ctx.stroke()

            this.#accumulator += angle
        }

        ctx.resetTransform()

        this.#startPoint = point2
    }

    #getPoint(radius: number, angle: number): Point {
        return {
            x: this.#center.x + radius * Math.cos(this.#accumulator + angle),
            y: this.#center.y + radius * Math.sin(this.#accumulator + angle)
        }
    }

    #isInsideSector(event: MouseEvent, value: Sector): boolean {
        const isAngle = (point: Point) => {
            let a = Math.atan2(point.y - this.#center.y, point.x - this.#center.x)
            if (a < 0)
                a += Math.PI * 2
            if (a < this.#startAngle)
                a = Math.PI * 2 - Math.abs(this.#startAngle - a) + this.#startAngle

            let index = this.#angles.findIndex(o => o.id == value.id),
                sumBefore = this.#angles[index].sum

            return sumBefore <= a && sumBefore + this.#angles[index].value - a >= 0
        }

        const isWithinRadius = (v: Point) => {
            return v.x * v.x + v.y * v.y <= this.#radius * this.#radius
                   && (!this.#isDonut || v.x * v.x + v.y * v.y
                       >= this.#radius * (value.innerRadius / 100) * this.#radius * (value.innerRadius / 100))
        }

        const point = this.getMousePosition(event),
            inner = {
                x: point.x - this.#center.x,
                y: point.y - this.#center.y
            },
            outer = {
                x: point.x - this.#center.x - value.translate?.x,
                y: point.y - this.#center.y - value.translate?.y
            }

        return isAngle(point) && (isWithinRadius(inner) || isWithinRadius(outer))
    }

    #drawEmpty() {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        ctx.beginPath()

        ctx.arc(this.#center.x, this.#center.y, this.#radius, 0, 2 * Math.PI)
        ctx.strokeStyle = Theme.text
        ctx.stroke()

        Helpers.TextStyles.regular(ctx)
        ctx.fillText(TextResources.allDataIsHidden, this.#center.x, this.#center.y)

        requestAnimationFrame(this.render.bind(this))
    }

    #drawInnerTitle() {
        if (this.#canRenderInnerTitle) {
            const ctx = Helpers.Canvas.getContext(this.canvas)

            this.#innerTitleStyle(ctx)
            ctx.fillText(this.data.innerTitle, this.#center.x, this.#center.y)
        }
    }

    #calculateSizes() {
        const titleOffset = this.settings.title
                            ? Constants.Values.titleOffset
                            : 0

        const shortSide = this.canvas.width > this.canvas.height - titleOffset * 2
                          ? this.canvas.height - titleOffset * 2
                          : this.canvas.width

        this.#center = {
            x: this.canvas.width / 2,
            y: titleOffset + this.canvas.height / 2
        }

        this.#radius = shortSide / 3

        if (this.data.innerTitle != undefined && this.data.innerTitle != '') {
            this.#innerTitleStyle = Helpers.TextStyles.large
            this.#canRenderInnerTitle = Helper.stringWidth(this.data.innerTitle, 16)
                                        < (this.data.innerRadius / 100) * this.#radius * 2

            if (!this.#canRenderInnerTitle) {
                this.#innerTitleStyle = Helpers.TextStyles.regular
                this.#canRenderInnerTitle = Helper.stringWidth(this.data.innerTitle, 14)
                                            < (this.data.innerRadius / 100) * this.#radius * 2
            }

            if (!this.#canRenderInnerTitle)
                console.warn(`Inner title is declared, but can't be rendered`)
        }

        this.#animationOffset = this.#radius * .1
    }

    refresh() {
        super.refresh()

        this.dropdown?.refresh()
    }

    resize() {
        super.resize()

        this.initAnimations()
        this.#calculateSizes()
        this.dropdown?.resize()
    }

    prepareSettings() {
        super.prepareSettings()

        this.#isDonut = (this.data.innerRadius ?? 0) != 0

        for (let item of this.data.values) {
            item.disabled = !item.value
            item.value ??= 0
            item.current = item.value
            item.innerRadius ??= this.data.innerRadius ?? 0

            if (item.value < 0)
                console.warn(`"${ item.label }" has negative value (${ item.value }) and will not be render`)
        }

        this.data.values = this.data.values.filter(v => v.value >= 0)

        if (this.settings.enableOther && this.data.values.length > 20) {
            this.#other = this.data.values.splice(20)

            const sum = this.#other.reduce((acc, v) => acc + v.current, 0)

            this.data.values = this.data.values.slice(0, 20)

            this.data.values.push(new Sector({
                value: sum,
                current: sum,
                label: TextResources.other,
                id: Helper.guid(),
                color: this.#other[this.#other.length - 1].color,
                innerRadius: this.data.innerRadius,
                data: {
                    _other: true
                }
            }))
        }
    }

    initDropdown() {
        super.initDropdown()

        this.dropdown = new Dropdown(this.canvas,
            {
                x: -10,
                y: 10,
                text: TextResources.menu,
                items: [
                    {
                        text: TextResources.exportPNG,
                        action: () => {
                            Export.asPng(this.canvas, this.settings.title)
                        }
                    },
                    {
                        text: TextResources.exportCSV,
                        action: () => {
                            Export.asCsv(Decomposition.toTable(CircularData.getRows(this.data)), this.settings.title)
                        }
                    },
                    {
                        isDivider: true
                    } as DropdownItem,
                    {
                        text: TextResources.decomposeToTable,
                        action: () => {
                            new Modal(Decomposition.toTable(CircularData.getRows(this.data))).open()
                        }
                    }
                ]
            })
    }
}