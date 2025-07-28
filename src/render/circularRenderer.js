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
        }

        this.#accumulator = this.#startAngle
        this.#isHover = false

        this.#draw()

        if (!this.#isInit)
            this.canvas.dispatchEvent(new MouseEvent('mousemove'))

        this.#isInit = true
    }

    #draw() {
        // ~! this.#onMouseMoveEvent never set null ?
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

            ctx.stroke()

            ctx.fillStyle = '#000000'
            ctx.textAlign = dir === 1 ? 'start' : 'end'
            ctx.font = '18px serif'
            ctx.fillText(value.label, endPoint.x + 10 * dir, endPoint.y)
        }

        let point2

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

        this.#accumulator += angle

        ctx.closePath()

        ctx.fillStyle = value.color
        ctx.fill()

        if (this.#onClickEvent && !isInner) {
            this.animations.add(value,
                AnimationTypes.mouseleave,
                {
                    timer: null,
                    duration: 100,
                    before: () => {
                        if (this.#onClickEvent !== null) {
                            let x = this.#onClickEvent.clientX - this.#canvasPosition.x,
                                y = this.#onClickEvent.clientY - this.#canvasPosition.y

                            if (ctx.isPointInPath(x, y))
                                if (this.#pinned.includes(value.id)) {
                                    this.#pinned = this.#pinned.filter(id => id !== value.id)
                                    this.#onClickEvent = null
                                } else {
                                    this.#pinned.push(value.id)
                                    this.#onClickEvent = null
                                }
                        }

                        return true
                    },
                    body: () => {
                        if (!this.#pinned.includes(value.id))
                            return

                        let direction = this.#accumulator - angle / 2

                        const transition = {
                            x: 20 * Math.cos(direction),
                            y: 20 * Math.sin(direction)
                        }

                        ctx.translate(transition.x, transition.y)

                        this.#accumulator -= angle

                        // ~! should transparent/invisible
                        ctx.fillStyle = '#ffffff'
                        ctx.fill()

                        point2 = this.#drawSector(value, point1, true)

                        ctx.resetTransform()
                    }
                })

        }

        if (this.#onMouseMoveEvent && !isInner) {
            this.animations.add(value,
                AnimationTypes.mouseleave,
                {
                    timer: null,
                    duration: 100,
                    before: () => {
                        let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x,
                            y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y

                        return !ctx.isPointInPath(x, y)
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            return

                        let direction = this.#accumulator - angle / 2

                        if (passed > duration)
                            passed = duration

                        const transition = {
                            x: 20 * Math.cos(direction) * (1 - passed / duration),
                            y: 20 * Math.sin(direction) * (1 - passed / duration)
                        }

                        ctx.translate(transition.x, transition.y)

                        this.#accumulator -= angle

                        // ~! should transparent/invisible
                        ctx.fillStyle = '#ffffff'
                        ctx.fill()

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
                        let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x,
                            y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y

                        return ctx.isPointInPath(x, y)
                    },
                    body: (passed, duration) => {
                        this.#isHover = true
                        this.#currentHover = value.hashCode()

                        let direction = this.#accumulator - angle / 2

                        if (passed > duration)
                            passed = duration

                        const transition = {
                            x: 20 * Math.cos(direction) * (passed / duration),
                            y: 20 * Math.sin(direction) * (passed / duration)
                        }

                        ctx.translate(transition.x, transition.y)

                        this.#accumulator -= angle

                        // ~! should transparent/invisible
                        ctx.fillStyle = '#ffffff'
                        ctx.fill()

                        point2 = this.#drawSector({
                                value: value.value,
                                color: adjustColor(value.color, 33),
                                label: value.label
                            },
                            point1,
                            true)

                        ctx.resetTransform()
                    }
                })
        }

        if (!isInner && (!this.#isInit || this.animations.contains(value, AnimationTypes.init))) {
            this.animations.add(value,
                AnimationTypes.init,
                {
                    timer: new Date(),
                    duration: 175 + this.data.values.indexOf(value) / this.data.values.length * 250,
                    before: (item, passed, duration) => {
                        return !item.timer || passed < duration
                    },
                    body: (passed, duration) => {
                        if (passed > duration)
                            passed = duration

                        const transition = passed / duration

                        const centerOfSector = {
                            x: this.#center.x + this.#radius / 2 * Math.cos(this.#accumulator - angle / 2),
                            y: this.#center.y + this.#radius / 2 * Math.sin(this.#accumulator - angle / 2)
                        }

                        const minSize = .7,
                            rest = 1 - minSize

                        ctx.translate(centerOfSector.x - centerOfSector.x * (minSize + transition * rest),
                            centerOfSector.y - centerOfSector.y * (minSize + transition * rest))
                        ctx.scale((minSize + transition * rest), (minSize + transition * rest))

                        this.#accumulator -= angle

                        // ~! should transparent/invisible
                        ctx.fillStyle = '#ffffff'
                        ctx.fill()

                        point2 = this.#drawSector({
                                value: value.value,
                                color: value.color + Math.round(256 * transition).toString(16),
                                label: value.label
                            },
                            point1,
                            true)

                        ctx.resetTransform()
                    }
                })
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

    destroy() {
        super.destroy();
    }
}