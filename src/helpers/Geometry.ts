import Point from '@/types/Point'

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

export function getInnerRadiusRatio(innerRadiusPercent: number, defaultPercent: number) {
    return clamp(Number.isFinite(innerRadiusPercent) ? innerRadiusPercent : defaultPercent, 0, 100) / 100
}

export function lerp(from: number, to: number, t: number) {
    return from + (to - from) * t
}

export function boxEdgeDistance(angle: number, halfWidth: number, halfHeight: number, distance: number) {
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))

    if (sin > 1e-6) {
        const horizontalEdgeCenter = (distance + halfHeight) / sin

        if (horizontalEdgeCenter * cos <= halfWidth)
            return horizontalEdgeCenter - distance
    }

    if (cos > 1e-6) {
        const verticalEdgeCenter = (distance + halfWidth) / cos

        if (verticalEdgeCenter * sin <= halfHeight)
            return verticalEdgeCenter - distance
    }

    const cornerProjection = cos * halfWidth + sin * halfHeight

    const discriminant = cornerProjection * cornerProjection
        - halfWidth * halfWidth
        - halfHeight * halfHeight
        + distance * distance

    return cornerProjection + Math.sqrt(Math.max(discriminant, 0)) - distance
}