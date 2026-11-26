import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import { firstMappedValue, groupBy } from '@/helpers/Collections'

const ANGLE_EPSILON = 1e-9

export default class ArcNeighbours {
    private readonly newByOld = new Map<RenderItem, RenderItem>()

    private readonly newByEnd: Map<string, RenderItem[]>

    private readonly oldByEnd: Map<string, RenderItem[]>

    constructor(
        newArcs: RenderItem[],
        oldArcs: RenderItem[],
        private readonly matches: Map<RenderItem, RenderItem>
    ) {
        for (const [item, old] of matches)
            this.newByOld.set(old, item)

        this.newByEnd = groupBy(newArcs, item => ArcNeighbours.angleKey(item, ArcNeighbours.arc(item).endAngle))
        this.oldByEnd = groupBy(oldArcs, item => ArcNeighbours.angleKey(item, ArcNeighbours.currentEnd(item)))
    }

    appearAngle(item: RenderItem) {
        return this.findAppearAngle(item, new Set())
    }

    disappearAngle(item: RenderItem) {
        return this.findDisappearAngle(item, new Set())
    }

    private findAppearAngle(item: RenderItem, visited: Set<RenderItem>): number {
        visited.add(item)

        const start = ArcNeighbours.arc(item).startAngle

        const before = this.unvisitedEndingAt(this.newByEnd, item, start, visited)

        const old = firstMappedValue(before, this.matches)

        if (old)
            return ArcNeighbours.currentEnd(old)

        return before.length > 0
               ? this.findAppearAngle(before[0], visited)
               : start
    }

    private findDisappearAngle(item: RenderItem, visited: Set<RenderItem>): number {
        visited.add(item)

        const start = ArcNeighbours.arc(item).current(item.animation.morph).startAngle

        const before = this.unvisitedEndingAt(this.oldByEnd, item, start, visited)

        const matchedNew = firstMappedValue(before, this.newByOld)

        if (matchedNew)
            return ArcNeighbours.arc(matchedNew).endAngle

        return before.length > 0
               ? this.findDisappearAngle(before[0], visited)
               : start
    }

    private unvisitedEndingAt(
        byEnd: Map<string, RenderItem[]>,
        item: RenderItem,
        angle: number,
        visited: Set<RenderItem>
    ) {
        return (byEnd.get(ArcNeighbours.angleKey(item, angle)) ?? []).filter(other => !visited.has(other))
    }

    private static arc(item: RenderItem) {
        return item.shape as RenderItemArc
    }

    private static currentEnd(item: RenderItem) {
        return ArcNeighbours.arc(item).current(item.animation.morph).endAngle
    }

    private static angleKey(item: RenderItem, angle: number) {
        return `${ item.panel?.index }|${ Math.round(angle / ANGLE_EPSILON) }`
    }
}