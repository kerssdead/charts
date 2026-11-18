import { boxEdgeDistanceForDirection, clamp } from '@/helpers/Geometry'
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
    direction: Point
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
            center: { x: 0, y: 0 },
            direction: { x: 1, y: 0 }
        }))

        const maxVisibleCount = getMaxVisibleCount(labels, this.distance, this.bounds)
        const boxes = allBoxes.length > maxVisibleCount
                      ? [...allBoxes].sort((a, b) => b.value - a.value).slice(0, maxVisibleCount)
                      : allBoxes

        for (const box of boxes) {
            this.updatePosition(box)

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
        const previousAngles = boxes.map(box => box.angle)

        for (let i = 0; i < boxes.length; i++) {
            const isLast = i === boxes.length - 1

            if (isLast && boxes.length < 3)
                break

            const current = boxes[i]
            const next = boxes[isLast ? 0 : i + 1]

            if (!this.shouldSeparate(current, next, isLast))
                continue

            this.move(current, -STEP)
            this.move(next, STEP)
        }

        return boxes.some((box, i) => box.angle !== previousAngles[i])
    }

    private shouldSeparate(current: Box, next: Box, isLast: boolean) {
        return this.isOverlap(current, next) || !isLast && current.angle > next.angle
    }

    private updatePosition(box: Box) {
        const { direction, center } = box

        direction.x = Math.cos(box.angle)
        direction.y = Math.sin(box.angle)

        const edgeDistance = boxEdgeDistanceForDirection(direction, box.halfWidth, box.halfHeight, this.distance)
        const push = this.distance + edgeDistance

        center.x = push * direction.x
        center.y = push * direction.y
    }

    private isCrossing(box: Box, other: Box) {
        const fromX = this.distance * box.direction.x
        const fromY = this.distance * box.direction.y
        const deltaX = clamp(fromX, box.center.x - box.halfWidth, box.center.x + box.halfWidth) - fromX
        const deltaY = clamp(fromY, box.center.y - box.halfHeight, box.center.y + box.halfHeight) - fromY

        const nearX = (other.center.x - other.halfWidth - SPACING - fromX) / deltaX
        const farX = (other.center.x + other.halfWidth + SPACING - fromX) / deltaX
        const nearY = (other.center.y - other.halfHeight - SPACING - fromY) / deltaY
        const farY = (other.center.y + other.halfHeight + SPACING - fromY) / deltaY

        const enter = Math.max(0, Math.min(nearX, farX), Math.min(nearY, farY))
        const exit = Math.min(1, Math.max(nearX, farX), Math.max(nearY, farY))

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
            this.updatePosition(box)
        }
    }

    private move(box: Box, step: number) {
        const { angle, direction, center } = box
        const { x: previousDirectionX, y: previousDirectionY } = direction
        const { x: previousCenterX, y: previousCenterY } = center

        box.angle = clamp(angle + step, box.middle - MAX_DRIFT, box.middle + MAX_DRIFT)

        if (box.angle === angle)
            return

        this.updatePosition(box)

        if (!this.isOutside(box))
            return

        box.angle = angle
        direction.x = previousDirectionX
        direction.y = previousDirectionY
        center.x = previousCenterX
        center.y = previousCenterY
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