class GaugeRenderer extends Renderer {
    data: GaugeData

    #radius: number

    #center: Point

    #dropdown: Dropdown

    #canvasPosition: DOMRect

    #onMouseMoveEvent: MouseEvent

    #onClickEvent: MouseEvent | undefined

    #isInit: boolean

    constructor(chart: Chart, settings: ChartSettings) {
        super(chart, settings)

        this.data = <GaugeData>chart.data

        this.#calculateSizes()

        this.#dropdown = new Dropdown(this.chart,
            this.canvas,
            {
                x: this.canvas.width - 10,
                y: 10,
                text: 'Menu',
                items: [
                    {
                        text: 'Export PNG',
                        action: () => {
                            const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

                            if (!ctx)
                                throw Helpers.Errors.nullContext

                            ctx.clearRect(this.#center.x + this.#radius, 0, this.canvas.width, this.canvas.height)

                            let destinationCanvas = document.createElement('canvas')
                            destinationCanvas.width = this.canvas.width
                            destinationCanvas.height = this.canvas.height

                            let destCtx = destinationCanvas.getContext('2d')

                            if (!destCtx)
                                throw Helpers.Errors.nullContext

                            destCtx.fillStyle = "#FFFFFF"
                            destCtx.fillRect(0, 0, this.canvas.width, this.canvas.height)

                            destCtx.drawImage(this.canvas, 0, 0)

                            let download = document.createElement('a')
                            download.href = destinationCanvas.toDataURL('image/png')
                            download.download = (this.settings.title ?? 'chart') + '.png'
                            download.click()
                        }
                    }
                ]
            })

        if (this.data.values.length > 0) {
            if ((<Sector>this.data.values[0]).value > this.data.max)
                (<Sector>this.data.values[0]).value = this.data.max
        }

        this.animations = new Animations()

        this.#initAnimations()
    }

    render() {
        super.render()

        this.#draw()

        const value = <Sector>this.data.values[0]
        this.tooltip.render(this.#isInsideSector(this.#onMouseMoveEvent, value),
            this.#onMouseMoveEvent,
            `${value?.label}: ${value?.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)

        this.#onClickEvent = this.#dropdown.render(this.#onMouseMoveEvent, this.#onClickEvent)

        requestAnimationFrame(this.render.bind(this))

        this.#isInit = true
    }

    #draw() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx)
            throw Helpers.Errors.nullContext

        const value = <Sector>(this.data.values[0] ?? { id: Helper.guid() })

        if (!this.#isInit || this.animations.contains(value.id, AnimationType.Init))
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

            let point1 = {
                x: this.#center.x + (this.#radius + 50) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 50) * Math.sin(Math.PI + localAccumulator)
            }

            let point2 = {
                x: this.#center.x + (this.#radius + 90) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 90) * Math.sin(Math.PI + localAccumulator)
            }

            let point3 = {
                x: this.#center.x + (this.#radius + 115) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 115) * Math.sin(Math.PI + localAccumulator)
            }

            const opacity = Math.PI - localAngle > angle ? '66' : 'ff'

            ctx.moveTo(point1.x, point1.y)
            ctx.lineTo(point2.x, point2.y)
            ctx.strokeStyle = '#000000' + opacity
            ctx.stroke()

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#000000' + opacity
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

        let x = event.clientX - this.#canvasPosition.x + window.scrollX,
            y = event.clientY - this.#canvasPosition.y + window.scrollY

        let point = { x: x, y: y }

        const inner = {
                x: point.x - this.#center.x,
                y: point.y - this.#center.y
            }

        return isAngle(point) && isWithinRadius(inner)
    }


    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.#canvasPosition.x += window.scrollX
        this.#canvasPosition.y += window.scrollY

        if (!this.#isInit) {
            this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
            this.canvas.onclick = event => this.#onClickEvent = event
        }
    }

    #calculateSizes() {
        const longSide = this.canvas.width < this.canvas.height
            ? this.canvas.height - 250
            : this.canvas.width

        this.#radius = longSide / 3

        this.#center = {
            x: this.canvas.width / 2,
            y: this.canvas.height - this.#radius / 3
        }
    }

    refresh() {
        super.refresh()
    }

    resize() {
        super.resize()

        this.#initAnimations()
        this.#calculateSizes()
    }

    resetMouse() {
        super.resetMouse()

        this.#onMouseMoveEvent = new MouseEvent('mousemove')
        this.#onClickEvent = new MouseEvent('click')
    }
}