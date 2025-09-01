import { ORenderer } from '/src/types/base/renderer.js'
import { OSector } from '/src/types/sector.js'
import { OCircularTypes, OAnimationTypes } from '/src/enums.js'
import { ODropdown } from '/src/dropdown.js'
import { OHelper } from '/src/helper.js'

export class OCircularRenderer extends ORenderer {
    /**
     * @type {boolean}
     */
    #isInit = false

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {OPoint}
     */
    #center

    /**
     * @type {number}
     */
    #radius

    /**
     * @type {number}
     */
    #sum

    /**
     * @type {number}
     */
    #accumulator

    /**
     * @type {MouseEvent}
     */
    #onMouseMoveEvent

    /**
     * @type {MouseEvent}
     */
    #onClickEvent

    /**
     * @type {number}
     */
    #startAngle

    /**
     * @type {string}
     */
    #currentHover

    /**
     * @type {boolean}
     */
    #isHover

    /**
     * @type {string[]}
     */
    #pinned

    /**
     * @type {object[]}
     */
    #angles

    /**
     * @type {OCircularData}
     */
    data

    /**
     * @type {OPoint}
     */
    #startPoint

    /**
     * @type {ODropdown}
     */
    #dropdown

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     * @param {ODynSettings} dynSettings
     */
    constructor(chart, settings, dynSettings) {
        super(chart, settings, dynSettings)

        this.data = this.chart.data
        this.data.values = this.data.values.map(v => new OSector(v))

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

        for (const value of this.data.values) {
            value.current = value.value
            value.innerRadius ??= this.data.type === OCircularTypes.donut
                ? this.data.innerRadius ?? 50
                : 0
        }

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

                            let width = OHelper.stringWidth('Export PNG') + 16,
                                height = 64

                            if (width < 50)
                                width = 50

                            ctx.clearRect(this.canvas.width - width, 0, width, height)

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

        this.#calculateSizes()

        this.#startAngle = Math.random() % (Math.PI * 2)

        this.#pinned = []

        this.#initAnimations()

        this.canvas.dispatchEvent(new MouseEvent('mousemove'))
    }

    render() {
        super.render()

        this.#accumulator = this.#startAngle
        this.#isHover = false
        this.canvas.style.cursor = 'default'

        if (this.data.values.filter(v => !v.disabled).length === 0)
            this.#drawEmpty()
        else
            this.#draw()

        this.#onClickEvent = this.#dropdown.render(this.#onMouseMoveEvent, this.#onClickEvent)

        this.#isInit = true
    }

    #draw() {
        if (this.#onMouseMoveEvent || !!this.#isInit === false) {
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

            this.#startPoint = {
                x: this.#center.x + this.#radius * Math.cos(this.#startAngle),
                y: this.#center.y + this.#radius * Math.sin(this.#startAngle)
            }

            for (const value of this.data.values)
                this.#drawSector(value)

            const value = this.data.values.find(v => v.id === this.#currentHover)
            this.tooltip.render(this.#isHover && this.#currentHover,
                this.#onMouseMoveEvent,
                `${value?.label}: ${value?.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)

            this.#drawInnerTitle()
        }

        requestAnimationFrame(this.render.bind(this))
    }

    /**
     * @param value {OSector}
     */
    #drawSector(value) {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        const piece = value.current / this.#sum,
            angle = (isNaN(piece) ? 1 : piece) * 2 * Math.PI

        const isSingle = this.data.values.filter(s => !s.disabled).length === 1

        if (!!this.#onClickEvent
            && !this.animations.contains(value, OAnimationTypes.init)
            && !isSingle) {
            this.animations.add(value,
                OAnimationTypes.click,
                {
                    duration: 100,
                    before: () => {
                        if (!!this.#onClickEvent) {
                            if (this.#isInsideSector(this.#onClickEvent, value)) {
                                if (this.#pinned.includes(value.id))
                                    this.#pinned = this.#pinned.filter(id => id !== value.id)
                                else
                                    this.#pinned.push(value.id)

                                this.#onClickEvent = new PointerEvent('click')
                            }
                        }

                        return true
                    },
                    body: () => {
                        if (!this.#pinned.includes(value.id))
                            return

                        let direction = this.#accumulator + angle / 2

                        const transition = {
                            x: 20 * Math.cos(direction),
                            y: 20 * Math.sin(direction)
                        }

                        ctx.translate(transition.x, transition.y)
                    }
                })
        }

        if (this.#onMouseMoveEvent && this.#isInsideSector(this.#onMouseMoveEvent, value)) {
            this.#currentHover = value.id
            this.#isHover = true
        }

        if (!this.#isInit || this.animations.contains(value, OAnimationTypes.init)) {
            this.animations.add(value,
                OAnimationTypes.init,
                {
                    timer: new Date(),
                    duration: 125 + (this.chart.data.values.indexOf(value) + 1) / this.chart.data.values.length * 175,
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
        } else if (this.#onMouseMoveEvent
            && !this.animations.contains(value, OAnimationTypes.init)
            && !this.#pinned.includes(value.id)
            && !isSingle) {
            this.animations.add(value,
                OAnimationTypes.mouseleave,
                {
                    duration: 100,
                    before: () => {
                        return !this.#isInsideSector(this.#onMouseMoveEvent, value)
                    },
                    body: transition => {
                        let direction = this.#accumulator + angle / 2

                        const transitionPos = {
                            x: 20 * Math.cos(direction) * (1 - transition),
                            y: 20 * Math.sin(direction) * (1 - transition)
                        }

                        ctx.translate(transitionPos.x, transitionPos.y)

                        value.transition = transitionPos

                        ctx.fillStyle = OHelper.adjustColor(value.color, Math.round(33 * (1 - transition)))
                        ctx.strokeStyle = OHelper.adjustColor(value.color, Math.round(33 * (1 - transition)))
                    }
                })

            this.animations.add(value,
                OAnimationTypes.mouseover,
                {
                    duration: 100,
                    before: () => {
                        return this.#isInsideSector(this.#onMouseMoveEvent, value)
                    },
                    body: transition => {
                        const actualPiece = value.current / this.#sum,
                            actualAngle = (isNaN(actualPiece) ? 1 : actualPiece) * 2 * Math.PI

                        this.animations.reload(value, OAnimationTypes.mouseleave)

                        this.canvas.style.cursor = 'pointer'

                        let direction = this.#accumulator + actualAngle / 2

                        const transitionPos = {
                            x: 20 * Math.cos(direction) * transition,
                            y: 20 * Math.sin(direction) * transition
                        }

                        ctx.translate(transitionPos.x, transitionPos.y)

                        value.transition = transitionPos

                        ctx.fillStyle = OHelper.adjustColor(value.color, Math.round(33 * transition))
                        ctx.strokeStyle = OHelper.adjustColor(value.color, Math.round(33 * transition))
                    }
                })
        }

        let point2 = {
            x: this.#center.x + this.#radius * Math.cos(this.#accumulator + angle),
            y: this.#center.y + this.#radius * Math.sin(this.#accumulator + angle)
        }

        if (angle > 0) {
            ctx.save()

            if (value.current > 0) {
                let labelStartPoint = {
                    x: this.#center.x + (this.#radius + 10) * Math.cos(this.#accumulator + angle / 2),
                    y: this.#center.y + (this.#radius + 10) * Math.sin(this.#accumulator + angle / 2)
                }

                let labelMidPoint = {
                    x: this.#center.x + (this.#radius + 20) * Math.cos(this.#accumulator + angle / 2),
                    y: this.#center.y + (this.#radius + 20) * Math.sin(this.#accumulator + angle / 2)
                }

                const dir = labelStartPoint.x > this.#center.x ? 1 : -1

                let endPoint = {
                    x: labelMidPoint.x + 10 * dir,
                    y: labelMidPoint.y
                }

                let isBusy = false

                const textWidth = OHelper.stringWidth(value.label),
                    imageDataX = dir === 1 ? endPoint.x + 8 : endPoint.x - textWidth - 8,
                    imageData = new Uint32Array(ctx.getImageData(imageDataX, endPoint.y - 12, textWidth, 24).data.buffer)

                if (imageDataX < 0 || imageDataX + textWidth > this.canvas.width
                    || endPoint.y - 12 < 0 || endPoint.y + 12 > this.canvas.height)
                    isBusy = true

                if (!isBusy)
                    for (let i = 0; i < imageData.length; i++)
                        if (imageData[i] & 0xff000000) {
                            isBusy = true
                            break
                        }

                if (!isBusy) {
                    ctx.beginPath()
                    ctx.moveTo(labelStartPoint.x, labelStartPoint.y)

                    ctx.quadraticCurveTo(labelMidPoint.x, labelMidPoint.y, endPoint.x, endPoint.y)

                    ctx.strokeStyle = '#000000'
                    ctx.stroke()

                    let opacity = Math.round(255 * (value.current / value.value)).toString(16)

                    if (opacity.length < 2)
                        opacity = 0 + opacity

                    ctx.fillStyle = '#000000' + opacity
                    ctx.textAlign = dir === 1 ? 'start' : 'end'
                    ctx.textBaseline = 'alphabetic'
                    ctx.font = '14px serif'
                    ctx.fillText(value.label, endPoint.x + 8 * dir, endPoint.y + 4)
                }
            }

            ctx.restore()

            ctx.beginPath()

            if (this.chart.data.type === OCircularTypes.pie)
                ctx.moveTo(this.#center.x, this.#center.y)

            ctx.lineTo(this.#startPoint.x, this.#startPoint.y)

            let localAccumulator = 0,
                localAngle = angle

            while (localAngle > 0) {
                let currentAngle = localAngle - Math.PI / 6 > 0
                    ? Math.PI / 6
                    : localAngle

                point2 = {
                    x: this.#center.x + this.#radius * Math.cos(this.#accumulator + localAccumulator + currentAngle),
                    y: this.#center.y + this.#radius * Math.sin(this.#accumulator + localAccumulator + currentAngle)
                }

                const tangentIntersectionAngle = Math.PI - currentAngle
                const lengthToTangentIntersection = this.#radius / Math.sin(tangentIntersectionAngle / 2)
                const tangentIntersectionPoint = {
                    x: this.#center.x + lengthToTangentIntersection * Math.cos(this.#accumulator + localAccumulator + currentAngle / 2),
                    y: this.#center.y + lengthToTangentIntersection * Math.sin(this.#accumulator + localAccumulator + currentAngle / 2)
                }

                ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

                localAccumulator += currentAngle

                localAngle -= Math.PI / 6
            }

            if (this.chart.data.type === OCircularTypes.donut || value.innerRadius !== 0) {
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

                    point2 = {
                        x: this.#center.x + innerRadius * Math.cos(this.#accumulator + localAccumulator - currentAngle),
                        y: this.#center.y + innerRadius * Math.sin(this.#accumulator + localAccumulator - currentAngle)
                    }

                    const tangentIntersectionAngle = Math.PI - currentAngle
                    const lengthToTangentIntersection = innerRadius / Math.sin(tangentIntersectionAngle / 2)
                    const tangentIntersectionPoint = {
                        x: this.#center.x + lengthToTangentIntersection * Math.cos(this.#accumulator + localAccumulator - currentAngle / 2),
                        y: this.#center.y + lengthToTangentIntersection * Math.sin(this.#accumulator + localAccumulator - currentAngle / 2)
                    }

                    ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

                    localAccumulator -= currentAngle

                    localAngle += Math.PI / 6
                }
            }

            ctx.closePath()

            ctx.fill()
            ctx.stroke()

            this.#accumulator += angle
        }

        ctx.resetTransform()

        this.#startPoint = point2
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
            if (a < this.#startAngle)
                a = Math.PI * 2 - Math.abs(this.#startAngle - a) + this.#startAngle

            let index = this.#angles.findIndex(o => o.id === value.id)
            let sumBefore = this.#angles[index].sum

            return sumBefore <= a && sumBefore + this.#angles[index].value - a >= 0
        }

        const isWithinRadius = v => {
            return v.x * v.x + v.y * v.y <= this.#radius * this.#radius
                && (this.data.type !== OCircularTypes.donut || v.x * v.x + v.y * v.y
                    >= this.#radius * (value.innerRadius / 100) * this.#radius * (value.innerRadius / 100))
        }

        let x = event.clientX - this.#canvasPosition.x + window.scrollX,
            y = event.clientY - this.#canvasPosition.y + window.scrollY

        let point = { x: x, y: y }

        const inner = {
                x: point.x - this.#center.x,
                y: point.y - this.#center.y
            },
            outer = {
                x: point.x - this.#center.x - value.transition?.x,
                y: point.y - this.#center.y - value.transition?.y
            }

        return isAngle(point) && (isWithinRadius(inner) || isWithinRadius(outer))
    }

    #drawEmpty() {
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

        ctx.clearRect(0, 0, this.#canvasPosition.width, this.#canvasPosition.height)

        ctx.closePath()
        ctx.beginPath()

        ctx.arc(this.#center.x, this.#center.y, this.#radius, 0, 2 * Math.PI)
        ctx.strokeStyle = '#000000'
        ctx.stroke()

        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#000000'
        ctx.fillText('All data is hidden', this.#center.x, this.#center.y)

        requestAnimationFrame(this.render.bind(this))
    }

    #drawInnerTitle() {
        if (this.data.innerTitle) {
            const ctx = this.canvas.getContext('2d', { willReadFrequently: true })

            ctx.beginPath()

            ctx.fillStyle = '#000000'
            ctx.font = '16px serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.data.innerTitle, this.#center.x, this.#center.y)

            ctx.closePath()
        }
    }

    #calculateSizes() {
        const shortSide = this.canvas.width > this.canvas.height
            ? this.canvas.height
            : this.canvas.width

        this.#center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }

        this.#radius = shortSide / 3
    }

    destroy() {
        super.destroy()
    }

    refresh() {
        super.refresh()

        this.#isInit = false

        this.#dropdown.refresh()
    }

    resize() {
        super.resize()

        this.#initAnimations()
        this.#calculateSizes()
    }
}