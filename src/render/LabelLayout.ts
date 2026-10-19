import { boxEdgeDistance, clamp } from '@/helpers/Geometry'
import Point from '@/types/Point'

const SPACING = 2

const STEP = .005

const ITERATIONS = 500

const MAX_DRIFT = Math.PI / 6

export type LabelBox = {
    angle: number
    value: number
    halfWidth: number
    halfHeight: number
}

export type LabelPlacement = {
    angle: number
    isVisible: boolean
}

type Box = LabelBox & {
    index: number
    middle: number
    center: Point
}

export default function layoutLabels(labels: LabelBox[], distance: number): LabelPlacement[] {
    const getCenter = (box: Box) => {
        const push = distance + boxEdgeDistance(box.angle, box.halfWidth, box.halfHeight)

        return {
            x: push * Math.cos(box.angle),
            y: push * Math.sin(box.angle)
        }
    }

    const isOverlap = (a: Box, b: Box) => {
        return Math.abs(a.center.x - b.center.x) < a.halfWidth + b.halfWidth + SPACING
               && Math.abs(a.center.y - b.center.y) < a.halfHeight + b.halfHeight + SPACING
    }

    const move = (box: Box, step: number) => {
        box.angle = clamp(box.angle + step, box.middle - MAX_DRIFT, box.middle + MAX_DRIFT)
        box.center = getCenter(box)
    }

    const boxes: Box[] = labels.map((label, index) => ({ ...label, index, middle: label.angle, center: { x: 0, y: 0 } }))
                               .sort((a, b) => a.middle - b.middle)

    for (const box of boxes)
        box.center = getCenter(box)

    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
        let isMoved = false

        for (let i = 0; i < boxes.length; i++) {
            const isLast = i == boxes.length - 1

            if (isLast && boxes.length < 3)
                break

            const current = boxes[i]
            const next = boxes[isLast ? 0 : i + 1]

            if (!isOverlap(current, next))
                continue

            move(current, -STEP)
            move(next, STEP)

            isMoved = true
        }

        if (!isMoved)
            break
    }

    const result: LabelPlacement[] = []
    const kept: Box[] = []

    for (const box of [...boxes].sort((a, b) => b.value - a.value)) {
        const isVisible = kept.every(other => !isOverlap(box, other))

        if (isVisible)
            kept.push(box)

        result[box.index] = { angle: box.angle, isVisible }
    }

    return result
}