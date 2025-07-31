class CircularRenderer extends Renderer {
    /**
     * @type {boolean}
     */
    #isInit = false

    /**
     * @type {DOMRect}
     */
    #canvasPosition

    /**
     * @type {Point}
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
     * @type {Date}
     */
    #globalTimer

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
    #isHover = false

    /**
     * @type {string[]}
     */
    #pinned

    /**
     * @type {object[]}
     */
    #angles

    render() {
        if (!this.#isInit) {
            super.render()

            const shortSide = this.canvas.width > this.canvas.height
                ? this.canvas.height
                : this.canvas.width

            this.#center = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2
            }

            this.#startAngle = Math.random() % (Math.PI * 2)

            this.#radius = shortSide / 3

            this.#sum = this.data.values.reduce((acc, v) => acc + v.value, 0)

            this.#globalTimer = new Date()

            this.#pinned = []

            this.#initAnimations()

            let anglesSum = this.#startAngle
            this.#angles = this.data.values.flatMap(sector => {
                const angle = sector.value / this.#sum * 2 * Math.PI

                return {
                    id: sector.id,
                    value: angle,
                    sum: (anglesSum += angle) - angle
                }
            })
                .reverse()
        }

        this.#accumulator = this.#startAngle
        this.#isHover = false
        document.body.style.cursor = 'default'

        this.#draw()

        if (!this.#isInit)
            this.canvas.dispatchEvent(new MouseEvent('mousemove'))

        this.#isInit = true
    }

    #draw() {
        if (this.animations.any() || this.#onMouseMoveEvent || !!this.#isInit === false) {
            const ctx = this.canvas.getContext('2d')

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            let nextPoint = {
                x: this.#center.x + this.#radius * Math.cos(this.#startAngle),
                y: this.#center.y + this.#radius * Math.sin(this.#startAngle)
            }

            for (const value of this.data.values)
                nextPoint = this.#drawSector(value, nextPoint)

            if (this.#onMouseMoveEvent)
                for (const value of this.data.values)
                    this.#drawTooltip(value)
        }

        const stamp = new Date()

        if (stamp - this.#globalTimer >= 1000 / 10) {
            this.#globalTimer = new Date()
            requestAnimationFrame(this.render.bind(this))
        } else {
            setTimeout(() => {
                this.#globalTimer = new Date()
                requestAnimationFrame(this.render.bind(this))
            }, stamp - this.#globalTimer)
        }
    }

    /**
     * @param value {Sector}
     * @param point1 {Point}
     * @param isInner {boolean?}
     */
    #drawSector(value, point1, isInner = false) {
        const ctx = this.canvas.getContext('2d')

        const piece = value.value / this.#sum,
            angle = piece * 2 * Math.PI

        ctx.fillStyle = value.color
        ctx.shadowBlur = null
        ctx.shadowColor = null

        if (!isInner) {
            let labelStartPoint = {
                x: this.#center.x + (this.#radius + 25) * Math.cos(this.#accumulator + angle / 2),
                y: this.#center.y + (this.#radius + 25) * Math.sin(this.#accumulator + angle / 2)
            }

            let labelMidPoint = {
                x: this.#center.x + (this.#radius + 50) * Math.cos(this.#accumulator + angle / 2),
                y: this.#center.y + (this.#radius + 50) * Math.sin(this.#accumulator + angle / 2)
            }

            ctx.beginPath()
            ctx.moveTo(labelStartPoint.x, labelStartPoint.y)

            const dir = labelStartPoint.x > this.#center.x ? 1 : -1

            let endPoint = {
                x: labelMidPoint.x + 40 * dir,
                y: labelMidPoint.y
            }

            ctx.quadraticCurveTo(labelMidPoint.x, labelMidPoint.y, endPoint.x, endPoint.y)

            ctx.strokeStyle = '#000000'
            ctx.stroke()

            ctx.fillStyle = '#000000'
            ctx.textAlign = dir === 1 ? 'start' : 'end'
            ctx.font = '18px serif'
            ctx.fillText(value.label, endPoint.x + 10 * dir, endPoint.y)
        }

        let point2 = {
            x: this.#center.x + this.#radius * Math.cos(this.#accumulator + angle),
            y: this.#center.y + this.#radius * Math.sin(this.#accumulator + angle)
        }

        if (!isInner && (!this.#isInit || this.animations.contains(value, AnimationTypes.init))) {
            this.animations.add(value,
                AnimationTypes.init,
                {
                    timer: new Date(),
                    duration: 125 + (this.data.values.indexOf(value) + 1) / this.data.values.length * 175,
                    before: (item, passed, duration) => {
                        return passed <= duration
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        const transition = passed / duration

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

                        point2 = this.#drawSector({
                                value: value.value,
                                color: value.color + opacity,
                                label: value.label,
                                id: value.id
                            },
                            point1,
                            true)

                        ctx.resetTransform()
                    }
                })
        }

        if (!!this.#onClickEvent && !isInner && !this.animations.contains(value, AnimationTypes.init)) {
            this.animations.add(value,
                AnimationTypes.click,
                {
                    timer: null,
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

                        point2 = this.#drawSector(value, point1, true)

                        ctx.resetTransform()
                    }
                })

        }

        if (this.#onMouseMoveEvent
            && !isInner
            && !this.animations.contains(value, AnimationTypes.init)
            && !this.#pinned.includes(value.id)) {
            this.animations.add(value,
                AnimationTypes.mouseleave,
                {
                    timer: null,
                    duration: 100,
                    before: () => {
                        return !this.#isInsideSector(this.#onMouseMoveEvent, value)
                    },
                    body: (passed, duration) => {
                        let direction = this.#accumulator + angle / 2

                        if (passed > duration || this.#currentHover === undefined)
                            passed = duration

                        const transition = {
                            x: 20 * Math.cos(direction) * (1 - passed / duration),
                            y: 20 * Math.sin(direction) * (1 - passed / duration)
                        }

                        ctx.translate(transition.x, transition.y)

                        point2 = this.#drawSector(value, point1, true)

                        ctx.resetTransform()
                    }
                })

            this.animations.add(value,
                AnimationTypes.mouseover,
                {
                    timer: null,
                    duration: 100,
                    before: () => {
                        return this.#isInsideSector(this.#onMouseMoveEvent, value)
                    },
                    body: (passed, duration) => {
                        this.animations.reload(value, AnimationTypes.mouseleave)

                        this.#isHover = true
                        this.#currentHover = value.hashCode()

                        document.body.style.cursor = 'pointer'

                        let direction = this.#accumulator + angle / 2

                        if (passed > duration)
                            passed = duration

                        const transition = {
                            x: 20 * Math.cos(direction) * (passed / duration),
                            y: 20 * Math.sin(direction) * (passed / duration)
                        }

                        ctx.translate(transition.x, transition.y)

                        point2 = this.#drawSector({
                                value: value.value,
                                color: adjustColor(value.color, 33),
                                label: value.label,
                                id: value.id
                            },
                            point1,
                            true)

                        ctx.resetTransform()
                    }
                })
        }

        if (isInner) {
            ctx.beginPath()
            ctx.moveTo(this.#center.x, this.#center.y)
            ctx.lineTo(point1.x, point1.y)

            let localAccumulator = 0,
                localAngle = angle

            while (localAngle > 0) {
                let currentAngle = 0

                if (localAngle - Math.PI / 6 > 0)
                    currentAngle = Math.PI / 6
                else
                    currentAngle = localAngle

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

            ctx.closePath()

            ctx.fillStyle = value.color
            ctx.strokeStyle = value.color
            ctx.fill()
            ctx.stroke()

            this.#accumulator += angle
        }

        return point2
    }

    /**
     * @param value {Sector}
     */
    #drawTooltip(value) {
        const ctx = this.canvas.getContext('2d')

        let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x,
            y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y

        if (this.#currentHover === value.hashCode() && this.#isHover) {
            const text = `${value.label}: ${value.value.toPrecision(2)}`

            ctx.beginPath()
            ctx.roundRect(x + 20, y + 20, text.width(18) + 10, 38, 20)
            ctx.fillStyle = '#00000077'
            ctx.shadowColor = '#00000077'
            ctx.shadowBlur = 20
            ctx.fill()

            ctx.fillStyle = '#ffffff'
            ctx.font = '18px serif'
            ctx.fillText(text, x + 35, y + 45)
        }
    }

    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.canvas.onmousemove = event => this.#onMouseMoveEvent = event
        this.canvas.onclick = event => this.#onClickEvent = event
    }

    /**
     * @param event {MouseEvent}
     * @param value {Sector}
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
        }

        let x = event.clientX - this.#canvasPosition.x,
            y = event.clientY - this.#canvasPosition.y

        let point = { x: x, y: y }

        return isAngle(point)
            && isWithinRadius({
                x: point.x - this.#center.x,
                y: point.y - this.#center.y
            })
    }

    destroy() {
        super.destroy();
    }
}