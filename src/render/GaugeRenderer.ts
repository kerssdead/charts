class GaugeRenderer extends Renderer<GaugeData> {
    #radius: number

    #center: Point

    constructor(chart: Chart) {
        super(chart)

        this.settings.enableLegend = false
    }

    render() {
        super.render()

        this.#draw()

        const value = this.data.values[0]
        this.tooltip.render(this.#isInsideSector(this.onMouseMoveEvent, value) && !this.dropdown?.isActive,
            this.onMouseMoveEvent,
            [
                new TooltipValue(`${ value?.label }: ${ Formatter.number(value?.current) }`)
            ])

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))

        this.state = RenderState.Idle

        super.renderDropdown()
    }

    #draw() {
        const ctx = Canvas.getContext(this.canvas)

        const value = this.data.values[0] ?? { id: Helper.guid() }

        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init))
            this.animations.add(value.id,
                AnimationType.Init,
                {
                    duration: 450,
                    continuous: true,
                    body: transition => {
                        value.current = value.value * transition
                    }
                })

        ctx.beginPath()

        ctx.strokeStyle = value.color
        ctx.lineCap = 'round'
        ctx.lineWidth = 40

        const piece = value.current / this.data.max,
            angle = (isNaN(piece) ? 1 : piece) * Math.PI

        if (value.value) {
            ctx.arc(this.#center.x, this.#center.y, this.#radius, Math.PI, angle - Math.PI)
            ctx.stroke()
        }

        ctx.beginPath()

        ctx.lineWidth = 1
        ctx.lineCap = 'square'

        let localAccumulator = 0,
            localAngle = Math.PI

        while (localAngle >= 0) {
            let currentAngle = localAngle - Math.PI / 10 > 0
                               ? Math.PI / 10
                               : localAngle

            const getPoint = (offset: number) => {
                return {
                    x: this.#center.x + (this.#radius + offset) * Math.cos(Math.PI + localAccumulator),
                    y: this.#center.y + (this.#radius + offset) * Math.sin(Math.PI + localAccumulator)
                }
            }

            let point1 = getPoint(50),
                point2 = getPoint(90),
                point3 = getPoint(115)

            const opacity = Math.PI - localAngle > angle ? '66' : 'ff'

            ctx.moveTo(point1.x, point1.y)
            ctx.lineTo(point2.x, point2.y)
            ctx.strokeStyle = Theme.text + opacity
            ctx.stroke()

            TextStyles.regular(ctx)
            ctx.fillStyle = Theme.text + opacity
            ctx.fillText((this.data.max - localAngle / Math.PI * this.data.max).toString(), point3.x, point3.y)

            localAccumulator += currentAngle

            localAngle -= Math.PI / 10
        }
    }

    #isInsideSector(event: MouseEvent, value: Sector): boolean {
        if (!event)
            return false

        const isAngle = (point: Point) => {
            let a = Math.atan2(point.y - this.#center.y, point.x - this.#center.x)
            if (a < 0)
                a += Math.PI * 2

            const piece = value.current / this.data.max,
                angle = (isNaN(piece) ? 1 : piece) * Math.PI

            return a > Math.PI && Math.PI + angle >= a
        }

        const isWithinRadius = (v: Point) => {
            const outerRadius = this.#radius + 20,
                innerRadius = this.#radius - 20

            return v.x * v.x + v.y * v.y <= outerRadius * outerRadius
                   && v.x * v.x + v.y * v.y >= innerRadius * innerRadius
        }

        const point = this.getMousePosition(event),
            inner = {
                x: point.x - this.#center.x,
                y: point.y - this.#center.y
            }

        return !(this.dropdown?.isActive ?? false)
               && isAngle(point)
               && isWithinRadius(inner)
    }

    #calculateSizes() {
        const longSide = this.canvas.width < this.canvas.height
                         ? this.canvas.height - 250
                         : this.canvas.width

        this.#radius = longSide / 3

        this.#center = {
            x: this.canvas.width / 2,
            y: this.canvas.height - this.#radius / 5
        }
    }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.initAnimations()
        this.#calculateSizes()
    }

    prepareSettings() {
        super.prepareSettings()

        for (let item of this.data.values) {
            item.disabled = !item.value
            item.value ??= 0
        }

        if (this.data.values.length > 0 && this.data.values[0].value > this.data.max)
            this.data.values[0].value = this.data.max
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
                    }
                ]
            })
    }
}