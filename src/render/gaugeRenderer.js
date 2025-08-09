class OGaugeRenderer extends ORenderer {
    /**
     * @type {OGaugeData}
     */
    data

    /**
     * @type {number}
     */
    #radius

    /**
     * @type {OPoint}
     */
    #center

    /**
     * @type {ODropdown}
     */
    #dropdown

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

        if (settings.enableOther && chart.data.values.length > 20) {
            const sum = chart.data.values.splice(20).reduce((acc, v) => acc + v.current, 0)

            chart.data.values = chart.data.values.slice(0, 20)

            chart.data.values.push({
                value: sum,
                current: sum,
                label: 'Other',
                id: OHelper.guid(),
                color: '#a3a3a3',
                innerRadius: this.data.innerRadius
            })
        }

        this.#radius = this.canvas.width > this.canvas.height
            ? this.canvas.width / 3
            : this.canvas.height / 3

        this.#dropdown = new ODropdown(this.chart,
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
                            ctx.clearRect(this.#center.x + this.#radius, 0, this.canvas.width, this.canvas.height)

                            let destinationCanvas = document.createElement('canvas')
                            destinationCanvas.width = this.canvas.width
                            destinationCanvas.height = this.canvas.height

                            let destCtx = destinationCanvas.getContext('2d')

                            destCtx.fillStyle = "#FFFFFF"
                            destCtx.fillRect(0, 0, this.canvas.width, this.canvas.height)

                            destCtx.drawImage(this.canvas, 0, 0)

                            let download = document.createElement('a')
                            download.href = destinationCanvas.toDataURL('image/png')
                            download.download = this.settings.title
                            download.click()
                        }
                    }
                ]
            })

        this.#center = {
            x: this.canvas.width / 2,
            y: this.canvas.height - this.#radius / 3
        }

        this.animations = new OAnimations()

        this.#initAnimations()
    }

    render() {
        super.render()

        this.#draw()

        if (this.#onMouseMoveEvent)
            this.#drawTooltip(this.data.values[0])

        this.#onClickEvent = this.#dropdown.render(this.#onMouseMoveEvent, this.#onClickEvent)

        requestAnimationFrame(this.render.bind(this))

        this.#isInit = true
    }

    #draw() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const value = this.data.values[0]

        if (!this.#isInit || this.animations.contains(value, OAnimationTypes.init))
            this.animations.add({ id: value.id },
                OAnimationTypes.init,
                {
                    timer: null,
                    duration: 450,
                    before: () => {
                        return true
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        value.current = value.value * (passed / duration)

                        if (passed === duration)
                            this.animations.delete({ id: value.id }, OAnimationTypes.init)
                    }
                })

        ctx.beginPath()

        ctx.strokeStyle = '#0288d1'
        ctx.lineCap = 'round'
        ctx.lineWidth = 40

        const piece = value.current / this.data.max,
            angle = (isNaN(piece) ? 1 : piece) * Math.PI

        let startPoint = {
            x: this.#center.x + this.#radius * Math.cos(Math.PI),
            y: this.#center.y + this.#radius * Math.sin(Math.PI)
        }

        ctx.lineTo(startPoint.x, startPoint.y)

        let localAccumulator = 0,
            localAngle = angle

        while (localAngle > 0) {
            let currentAngle = localAngle - Math.PI / 6 > 0
                ? Math.PI / 6
                : localAngle

            let point2 = {
                x: this.#center.x + this.#radius * Math.cos(Math.PI + localAccumulator + currentAngle),
                y: this.#center.y + this.#radius * Math.sin(Math.PI + localAccumulator + currentAngle)
            }

            const tangentIntersectionAngle = Math.PI - currentAngle
            const lengthToTangentIntersection = this.#radius / Math.sin(tangentIntersectionAngle / 2)
            const tangentIntersectionPoint = {
                x: this.#center.x + lengthToTangentIntersection * Math.cos(Math.PI + localAccumulator + currentAngle / 2),
                y: this.#center.y + lengthToTangentIntersection * Math.sin(Math.PI + localAccumulator + currentAngle / 2)
            }

            ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

            localAccumulator += currentAngle

            localAngle -= Math.PI / 6
        }

        ctx.stroke()

        ctx.closePath()

        ctx.beginPath()

        ctx.lineWidth = 1
        ctx.lineCap = 'square'

        localAccumulator = 0
        localAngle = Math.PI

        while (localAngle >= 0) {
            let currentAngle = localAngle - Math.PI / 10 > 0
                ? Math.PI / 10
                : localAngle

            let point3 = {
                x: this.#center.x + (this.#radius + 50) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 50) * Math.sin(Math.PI + localAccumulator)
            }

            let point4 = {
                x: this.#center.x + (this.#radius + 90) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 90) * Math.sin(Math.PI + localAccumulator)
            }

            let point5 = {
                x: this.#center.x + (this.#radius + 115) * Math.cos(Math.PI + localAccumulator),
                y: this.#center.y + (this.#radius + 115) * Math.sin(Math.PI + localAccumulator)
            }

            const opacity = Math.PI - localAngle > angle ? '66' : 'ff'

            ctx.moveTo(point3.x, point3.y)
            ctx.lineTo(point4.x, point4.y)
            ctx.strokeStyle = '#000000' + opacity
            ctx.stroke()

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#000000' + opacity
            ctx.fillText((100 - localAngle / Math.PI * 100).toString(), point5.x, point5.y)

            localAccumulator += currentAngle

            localAngle -= Math.PI / 10
        }
    }

    /**
     * @param value {OSector}
     */
    #drawTooltip(value) {
        if (!this.chart.settings.enableTooltip)
            return

        if (this.#isInsideSector(this.#onMouseMoveEvent, value)) {
            const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

            let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x,
                y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y + window.scrollY

            const text = `${value.label}: ${value.current.toPrecision(2)}`

            ctx.beginPath()
            ctx.roundRect(x += 12, y += 10, OHelper.stringWidth(text) + 16, 34, 20)
            ctx.fillStyle = '#00000077'
            ctx.shadowColor = '#00000077'
            ctx.shadowBlur = 20
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.font = '14px serif'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'middle'
            ctx.fillText(text, x + 10, y + 18)
        }
    }

    /**
     * @param event {MouseEvent}
     * @param value {OSector}
     *
     * @return {boolean}
     */
    #isInsideSector(event, value) {
        const isAngle = point => {
            let a = Math.atan2(point.y - this.#center.y, point.x - this.#center.x)
            if (a < 0)
                a += Math.PI * 2

            const piece = value.current / this.data.max,
                angle = (isNaN(piece) ? 1 : piece) * Math.PI

            return Math.PI + angle >= a
        }

        const isWithinRadius = v => {
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

        this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
        this.canvas.onclick = event => this.#onClickEvent = event
    }
}