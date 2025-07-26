class CircularRenderer extends Renderer {
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
     * @type {Point}
     */
    #point1

    /**
     * @type {Point}
     */
    #point2

    render() {
        super.render()

        this.#center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }

        this.#radius = this.canvas.width / 3

        this.#sum = this.data.values.reduce((acc, v) => acc + v.value, 0)

        this.#accumulator = 0

        this.#point1 = { x: this.#center.x + this.#radius, y: this.#center.y }
        this.#point2 = { x: -1, y: -1 }

        this.#draw(null)

        this.#initAnimations()
    }

    /**
     * @param action {function(arg1:Sector, arg2:number)}
     */
    #draw(action) {
        for (const value of this.data.values)
            this.#drawSector(value, action)

        const ctx = this.canvas.getContext('2d')

        ctx.beginPath()
        ctx.arc(this.#center.x, this.#center.y, this.#radius, 0, Math.PI * 2)
        ctx.stroke()
    }

    #drawSector(value, apply) {
        const ctx = this.canvas.getContext('2d')

        const piece = value.value / this.#sum,
            angle = piece * 2 * Math.PI

        const originalPoint1 = this.#point1

        ctx.beginPath()
        ctx.moveTo(this.#center.x, this.#center.y)
        ctx.lineTo(this.#point1.x, this.#point1.y)

        let localAccumulator = 0,
            localAngle = angle

        while (localAngle > 0) {
            let currentAngle = 0

            if (localAngle - Math.PI / 6 > 0)
                currentAngle = Math.PI / 6
            else
                currentAngle = localAngle

            this.#point2 = {
                x: this.#center.x + this.#radius * Math.cos(this.#accumulator + localAccumulator + currentAngle),
                y: this.#center.y + this.#radius * Math.sin(this.#accumulator + localAccumulator + currentAngle)
            }

            const tangentIntersectionAngle = Math.PI - currentAngle
            const lengthToTangentIntersection = this.#radius / Math.sin(tangentIntersectionAngle / 2)
            const tangentIntersectionPoint = {
                x: this.#center.x + lengthToTangentIntersection * Math.cos(this.#accumulator + localAccumulator + currentAngle / 2),
                y: this.#center.y + lengthToTangentIntersection * Math.sin(this.#accumulator + localAccumulator + currentAngle / 2)
            }

            ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, this.#point2.x, this.#point2.y)

            localAccumulator += currentAngle

            localAngle -= Math.PI / 6
        }

        this.#accumulator += angle

        ctx.closePath()

        ctx.fillStyle = value.color
        ctx.fill()

        if (apply) {
            const res = apply(value, this.#accumulator - angle / 2)

            if (res) {
                this.#point1 = originalPoint1
                this.#accumulator -= angle

                ctx.fillStyle = '#ffffff'
                ctx.fill()

                this.#drawSector(res, null)

                ctx.resetTransform()
            }
        }

        this.#point1 = this.#point2
    }

    #initAnimations() {
        const ctx = this.canvas.getContext('2d')

        this.#canvasPosition = this.canvas.getBoundingClientRect()

        function adjustColor(color, amount) {
            return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
        }

        this.canvas.onmousemove = event => {
            let x = event.clientX - this.#canvasPosition.x,
                y = event.clientY - this.#canvasPosition.y

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            let lastTranslate = { x: 0, y: 0 }

            /**
             * @param sector {Sector}
             * @param angle {number}
             *
             * @return {Sector}
             */
            const process = (sector, angle) => {
                if (!ctx.isPointInPath(x, y))
                    return null

                lastTranslate = {
                    x: 20 * Math.cos(angle),
                    y: 20 * Math.sin(angle)
                }

                ctx.translate(lastTranslate.x, lastTranslate.y)

                return {
                        value: sector.value,
                        color: adjustColor(sector.color, 33)
                    }
            }

            this.#draw(process)
        }
    }

    destroy() {
        super.destroy();
    }
}