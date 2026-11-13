import Point from '@/types/Point'
import { FULL_ANGLE } from '@/static/constants/Index'
import { ArcEdge } from '@/static/Enums'

const FULL_CIRCLE_EPSILON = 1e-6

export type ArcShape = {
    x: number
    y: number
    start: number
    end: number
    middle: number
}

export type SectorOutline = {
    radius: number
    innerRadius: number
    gap: number
    cornerRadius: number
}

export type PlacedSector = SectorOutline & {
    x: number
    y: number
    startAngle: number
    endAngle: number
    pull: number
}

type Ring = {
    radius: number
    cornerRadius: number
    isOuter: boolean
}

type Corner = Point & {
    radius: number
    angle: number
    edge: number
    circle: number
}

export const isFullCircle = (sweep: number) => sweep >= FULL_ANGLE - FULL_CIRCLE_EPSILON

export function traceSector(ctx: CanvasRenderingContext2D, shape: ArcShape, outline: SectorOutline): boolean {
    const angle = shape.end - shape.start

    if (angle <= 0)
        return false

    const sin = Math.sin(Math.min(angle, Math.PI) / 2)
    const outer = outline.radius
    const halfGap = Math.min(outline.gap / 2, outer * sin / 2)

    const isApex = outline.innerRadius * sin <= halfGap
    const apexRadius = Math.max(Math.min(halfGap / sin, outline.gap), outline.innerRadius)
    const inner = isApex ? apexRadius : outline.innerRadius

    const radialLimit = (outer - inner) / 2
    const outerArcLimit = angle < Math.PI ? (outer * sin - halfGap) / (1 + sin) : Infinity
    const innerArcLimit = sin < 1 ? (inner * sin - halfGap) / (1 - sin) : Infinity

    const outerCorner = Math.max(Math.min(outline.cornerRadius, radialLimit, outerArcLimit), 0)
    const innerCorner = isApex
        ? 0
        : Math.max(Math.min(outline.cornerRadius, radialLimit, innerArcLimit), 0)

    const outerRing = { radius: outer, cornerRadius: outerCorner, isOuter: true }
    const outerStart = getCorner(shape, ArcEdge.Start, outerRing, halfGap)
    const outerEnd = getCorner(shape, ArcEdge.End, outerRing, halfGap)

    traceCorner(ctx, outerStart, outerStart.edge, outerStart.circle)
    ctx.arc(shape.x, shape.y, outer, outerStart.angle, outerEnd.angle)
    traceCorner(ctx, outerEnd, outerEnd.circle, outerEnd.edge)

    if (isApex) {
        ctx.lineTo(shape.x + inner * Math.cos(shape.middle), shape.y + inner * Math.sin(shape.middle))
    } else {
        const innerRing = { radius: inner, cornerRadius: innerCorner, isOuter: false }
        const innerEnd = getCorner(shape, ArcEdge.End, innerRing, halfGap)
        const innerStart = getCorner(shape, ArcEdge.Start, innerRing, halfGap)

        traceCorner(ctx, innerEnd, innerEnd.edge, innerEnd.circle)
        ctx.arc(shape.x, shape.y, inner, innerEnd.angle, innerStart.angle, true)
        traceCorner(ctx, innerStart, innerStart.circle, innerStart.edge)
    }

    ctx.closePath()

    return true
}

export function isInsideSector(point: Point, sector: PlacedSector): boolean {
    const sweep = sector.endAngle - sector.startAngle
    const pull = isFullCircle(sweep) ? 0 : sector.pull
    const middle = sector.startAngle + sweep / 2

    const dx = point.x - sector.x - pull * Math.cos(middle)
    const dy = point.y - sector.y - pull * Math.sin(middle)

    const distance = dx * dx + dy * dy

    if (distance > sector.radius * sector.radius || distance < sector.innerRadius * sector.innerRadius)
        return false

    if (isFullCircle(sweep))
        return true

    const angle = ((Math.atan2(dy, dx) - sector.startAngle) % FULL_ANGLE + FULL_ANGLE) % FULL_ANGLE

    if (angle > sweep)
        return false

    const half = Math.min(sector.gap / 2, sector.radius * Math.sin(Math.min(sweep, Math.PI) / 2) / 2)

    return rayDistance(dx, dy, sector.startAngle) >= half && rayDistance(dx, dy, sector.endAngle) >= half
}

function traceCorner(ctx: CanvasRenderingContext2D, corner: Corner, from: number, to: number) {
    const turn = Math.atan2(Math.sin(to - from), Math.cos(to - from))

    ctx.arc(corner.x, corner.y, corner.radius, from, from + turn, turn < 0)
}

function getCorner(shape: ArcShape, edge: ArcEdge, ring: Ring, halfGap: number): Corner {
    const { radius, cornerRadius, isOuter } = ring
    const edgeAngle = edge === ArcEdge.Start ? shape.start : shape.end
    const side = edge === ArcEdge.Start ? 1 : -1
    const offset = halfGap + cornerRadius
    const distance = isOuter ? radius - cornerRadius : radius + cornerRadius
    const along = Math.sqrt(Math.max(distance * distance - offset * offset, 0))

    const angle = edgeAngle + Math.atan2(side * offset, along)

    const x = shape.x + distance * Math.cos(angle)
    const y = shape.y + distance * Math.sin(angle)

    const edgeX = shape.x + along * Math.cos(edgeAngle) - side * halfGap * Math.sin(edgeAngle)
    const edgeY = shape.y + along * Math.sin(edgeAngle) + side * halfGap * Math.cos(edgeAngle)

    return {
        x,
        y,
        radius: cornerRadius,
        angle,
        edge: Math.atan2(edgeY - y, edgeX - x),
        circle: isOuter ? angle : angle + Math.PI
    }
}

function rayDistance(dx: number, dy: number, angle: number) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return dx * cos + dy * sin <= 0
           ? Math.hypot(dx, dy)
           : Math.abs(dy * cos - dx * sin)
}