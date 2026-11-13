import Point from '@/types/Point'
import HoverMap from '@/types/HoverMap'
import { FULL_ANGLE } from '@/static/constants/Index'

const MARKER_RADIUS = 4

export default class LineMarkers {
    private readonly hovers = new HoverMap<number>()

    render(ctx: CanvasRenderingContext2D, stops: Point[], lineWidth: number) {
        for (const index of this.hovers.keys()) {
            const marker = stops[index]
            const radius = (lineWidth / 2 + MARKER_RADIUS) * this.hovers.value(index)

            if (!marker || radius <= 0)
                continue

            ctx.beginPath()
            ctx.arc(marker.x, marker.y, radius, 0, FULL_ANGLE)
            ctx.fill()
        }
    }

    animate(hoveredIndex: number, now: DOMHighResTimeStamp): boolean {
        const targets = new Map<number, boolean>()

        for (const [index, hover] of this.hovers.entries())
            if (!hover.isIdle)
                targets.set(index, false)

        if (hoveredIndex >= 0)
            targets.set(hoveredIndex, true)

        this.hovers.update([...targets], now)

        return this.hovers.isAnimating
    }
}