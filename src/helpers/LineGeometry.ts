import Point from '@/types/Point'
import CanvasWindow from '@/types/CanvasWindow'
import { Bounds } from '@/types/interfaces/RenderItemBase'

export function mapLineStops(window: CanvasWindow, stops: Point[], canvas: Point[]) {
    const mapped = canvas.length === stops.length ? canvas : stops.map(() => ({ x: 0, y: 0 }))

    let isSortedX = true

    for (let i = 0; i < stops.length; i++) {
        mapped[i].x = window.mapX(stops[i].x)
        mapped[i].y = window.mapY(stops[i].y)

        if (i > 0 && mapped[i].x < mapped[i - 1].x)
            isSortedX = false
    }

    return { canvas: mapped, isSortedX }
}

export function getLineBounds(canvas: Point[], padding: number, baseline: number | null): Bounds | null {
    if (canvas.length === 0)
        return null

    let left = Infinity
    let top = Infinity
    let right = -Infinity
    let bottom = -Infinity

    for (let i = 0; i < canvas.length; i++) {
        const stop = canvas[i]

        left = Math.min(left, stop.x)
        top = Math.min(top, stop.y)
        right = Math.max(right, stop.x)
        bottom = Math.max(bottom, stop.y)
    }

    if (baseline != null) {
        top = Math.min(top, baseline)
        bottom = Math.max(bottom, baseline)
    }

    return {
        left: left - padding,
        top: top - padding,
        right: right + padding,
        bottom: bottom + padding
    }
}