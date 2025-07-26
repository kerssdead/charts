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
     * @type {Date}
     */
    #timer

    /**
     * @type {number}
     */
    #animationHash

    /**
     * @type {MouseEvent}
     */
    #onMouseMoveEvent

    /**
     * @type {Date}
     */
    #globalTimer

    render() {
        // console.log('render')

        if (!this.#isInit) {
            super.render()

            this.#center = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2
            }

            this.#radius = this.canvas.width / 3

            this.#sum = this.data.values.reduce((acc, v) => acc + v.value, 0)

            this.#globalTimer = new Date()

            this.#initAnimations()
        }

        this.#accumulator = 0

        this.#draw()

        this.#isInit = true
    }

    #draw() {
        if (this.#onMouseMoveEvent || !!this.#isInit === false) {
            const ctx = this.canvas.getContext('2d')

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            let nextPoint = { x: this.#center.x + this.#radius, y: this.#center.y }

            for (const value of this.data.values)
                nextPoint = this.#drawSector(value, nextPoint)

            function radiansToDegrees(radians)
            {
                return radians * (180 / Math.PI)
            }

            console.log(radiansToDegrees(this.#accumulator))
        }

        const stamp = new Date()

        if (stamp - this.#globalTimer >= 1000 / 10)
            requestAnimationFrame(this.render.bind(this))
        else
            setTimeout(() => requestAnimationFrame(this.render.bind(this)), stamp - this.#globalTimer)
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

        if (this.#onMouseMoveEvent && !isInner) {
            let x = this.#onMouseMoveEvent.clientX - this.#canvasPosition.x,
                y = this.#onMouseMoveEvent.clientY - this.#canvasPosition.y

            if (ctx.isPointInPath(x, y)) {
                let direction = this.#accumulator - angle / 2

                this.#initTimer(value)

                const stamp = new Date()

                let passed = stamp - this.#timer

                const duration = 100

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
                    color: adjustColor(value.color, 33)
                }, point1, true)

                ctx.resetTransform()
            }
        } else {

        }

        return point2
    }

    #initAnimations() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()

        this.canvas.onmousemove = event => {
            this.#onMouseMoveEvent = event
        }
    }

    /**
     * @param entity {object}
     */
    #initTimer(entity) {
        const hash = entity.hashCode()

        if (hash !== this.#animationHash)
            this.#timer = new Date()

        this.#animationHash = hash
    }

    destroy() {
        super.destroy();
    }
}