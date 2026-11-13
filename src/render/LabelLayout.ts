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
    origin: number
    middle: number
    center: Point
}

export default function layoutLabels(labels: LabelBox[], distance: number, bounds: Point): LabelPlacement[] {
    const arranger = new LabelArranger(distance, bounds)
    const boxes = arranger.place(labels)

    arranger.spread(boxes)

    return arranger.pickVisible(labels, boxes)
}

class LabelArranger {
    private readonly distance: number

    private readonly bounds: Point

    constructor(distance: number, bounds: Point) {
        this.distance = distance
        this.bounds = bounds
    }

    place(labels: LabelBox[]) {
        const allBoxes: Box[] = labels.map((label, index) => ({
            ...label,
            index,
            origin: label.angle,
            middle: label.angle,
            center: { x: 0, y: 0 }
        }))

        const maxVisibleCount = getMaxVisibleCount(labels, this.distance, this.bounds)
        const boxes = allBoxes.length > maxVisibleCount
                      ? [...allBoxes].sort((a, b) => b.value - a.value).slice(0, maxVisibleCount)
                      : allBoxes

        for (const box of boxes) {
            box.center = this.getCenter(box)

            this.fit(box)

            box.middle = box.angle
        }

        return boxes.sort((a, b) => a.origin - b.origin)
    }

    spread(boxes: Box[]) {
        for (let iteration = 0; iteration < ITERATIONS; iteration++)
            if (!this.spreadOnce(boxes))
                break

        for (const box of boxes)
            this.fit(box)
    }

    pickVisible(labels: LabelBox[], boxes: Box[]) {
        const result: LabelPlacement[] = labels.map(label => ({ angle: label.angle, isVisible: false }))
        const kept: Box[] = []

        for (const box of [...boxes].sort((a, b) => b.value - a.value)) {
            const isVisible = !this.isOutside(box) && kept.every(other => !this.isOverlap(box, other))

            if (isVisible)
                kept.push(box)

            result[box.index] = { angle: box.angle, isVisible }
        }

        return result
    }

    private spreadOnce(boxes: Box[]) {
        let isMoved = false

        for (let i = 0; i < boxes.length; i++) {
            const isLast = i === boxes.length - 1

            if (isLast && boxes.length < 3)
                break

            const current = boxes[i]
            const next = boxes[isLast ? 0 : i + 1]

            if (!this.shouldSeparate(current, next, isLast))
                continue

            isMoved = this.move(current, -STEP) || isMoved
            isMoved = this.move(next, STEP) || isMoved
        }

        return isMoved
    }

    private shouldSeparate(current: Box, next: Box, isLast: boolean) {
        return this.isOverlap(current, next) || !isLast && current.angle > next.angle
    }

    private getCenter(box: Box) {
        const push = this.distance + boxEdgeDistance(box.angle, box.halfWidth, box.halfHeight, this.distance)

        return {
            x: push * Math.cos(box.angle),
            y: push * Math.sin(box.angle)
        }
    }

    private isCrossing(box: Box, other: Box) {
        const from = { x: this.distance * Math.cos(box.angle), y: this.distance * Math.sin(box.angle) }
        const to = {
            x: clamp(from.x, box.center.x - box.halfWidth, box.center.x + box.halfWidth),
            y: clamp(from.y, box.center.y - box.halfHeight, box.center.y + box.halfHeight)
        }

        let enter = 0
        let exit = 1

        for (const [axis, half] of [['x', other.halfWidth], ['y', other.halfHeight]] as const) {
            const delta = to[axis] - from[axis]
            const near = (other.center[axis] - half - SPACING - from[axis]) / delta
            const far = (other.center[axis] + half + SPACING - from[axis]) / delta

            enter = Math.max(enter, Math.min(near, far))
            exit = Math.min(exit, Math.max(near, far))
        }

        return enter < exit
    }

    private isOverlap(a: Box, b: Box) {
        return Math.abs(a.center.x - b.center.x) < a.halfWidth + b.halfWidth + SPACING
               && Math.abs(a.center.y - b.center.y) < a.halfHeight + b.halfHeight + SPACING
               || this.isCrossing(a, b) || this.isCrossing(b, a)
    }

    private isOutside(box: Box) {
        return Math.abs(box.center.x) + box.halfWidth > this.bounds.x
               || Math.abs(box.center.y) + box.halfHeight > this.bounds.y
    }

    private fit(box: Box) {
        for (let iteration = 0; iteration < ITERATIONS && this.isOutside(box); iteration++) {
            const sign = Math.sign(Math.sin(box.angle) * Math.cos(box.angle)) || 1

            box.angle += (Math.abs(box.center.y) + box.halfHeight > this.bounds.y ? -sign : sign) * STEP
            box.center = this.getCenter(box)
        }
    }

    private move(box: Box, step: number) {
        const { angle, center } = box

        box.angle = clamp(angle + step, box.middle - MAX_DRIFT, box.middle + MAX_DRIFT)
        box.center = this.getCenter(box)

        if (!this.isOutside(box))
            return box.angle !== angle

        box.angle = angle
        box.center = center

        return false
    }
}

function getMaxVisibleCount(labels: LabelBox[], distance: number, bounds: Point) {
    const minHalfWidth = labels.reduce((min, label) => Math.min(min, label.halfWidth), Infinity)
    const minHalfHeight = labels.reduce((min, label) => Math.min(min, label.halfHeight), Infinity)

    const excludedRadius = Math.max(Math.min(distance - SPACING / 2, bounds.x, bounds.y), 0)
    const boundsArea = (2 * bounds.x + SPACING) * (2 * bounds.y + SPACING)
    const freeArea = boundsArea - Math.PI * excludedRadius * excludedRadius
    const labelArea = (2 * minHalfWidth + SPACING) * (2 * minHalfHeight + SPACING)

    return Math.floor(freeArea / labelArea)
}