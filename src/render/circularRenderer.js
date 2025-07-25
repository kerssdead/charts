class CircularRenderer extends Renderer {
    render() {
        super.render()

        const center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }

        const radius = this.canvas.width / 2

        const sum = this.data.values.reduce((acc, v) => acc + v.value, 0)

        let accumulator = 0

        let point1 = { x: 2 * radius, y: radius },
            point2 = { x: 0, y: 0 }

        for (const value of this.data.values) {
            const piece = value.value / sum,
                angle = piece * 2 * Math.PI

            const ctx = this.canvas.getContext('2d')

            ctx.beginPath()
            ctx.moveTo(center.x, center.y)
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
                    x: radius * Math.cos(accumulator + localAccumulator + currentAngle) + radius,
                    y: radius * Math.sin(accumulator + localAccumulator + currentAngle) + radius
                }

                const tangentIntersectionAngle = Math.PI - currentAngle
                const lengthToTangentIntersection = radius / Math.sin(tangentIntersectionAngle / 2)
                const tangentIntersectionPoint = {
                    x: lengthToTangentIntersection * Math.cos(accumulator + localAccumulator + currentAngle / 2) + radius,
                    y: lengthToTangentIntersection * Math.sin(accumulator + localAccumulator + currentAngle / 2) + radius
                }

                ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y)

                localAccumulator += currentAngle

                localAngle -= Math.PI / 6
            }

             accumulator += angle

            ctx.closePath()

            ctx.fillStyle = value.color
            ctx.fill()

            point1 = point2
        }
    }

    destroy() {
        super.destroy();
    }
}