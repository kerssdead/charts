import Queue from 'render/Queue'
import PlotProcess from 'render/PlotProcess'
import RenderItem from 'types/RenderItem'

export default class Transition {
    static snapshot(queue: Queue): Map<string, RenderItem> {
        const previous = new Map<string, RenderItem>()

        for (const item of queue.queue)
            if (item.key != null && !item.animation.isLeaving && !item.animation.removeAfterMorph)
                previous.set(item.key, item)

        return previous
    }

    static apply(queue: Queue,
                 previous: Map<string, RenderItem>,
                 previousPlot: PlotProcess | null,
                 nextPlot: PlotProcess | null,
                 duration: number) {
        const verticalPrevious = previousPlot && !previousPlot.isHorizontal ? previousPlot : null
        const verticalNext = nextPlot && !nextPlot.isHorizontal ? nextPlot : null

        const toPrevious = verticalPrevious && verticalNext
                           ? (y: number) => {
                return verticalPrevious.getAxisY(verticalNext.getAxisValue(y))
            }
                           : undefined
        const toNext = verticalPrevious && verticalNext
                       ? (y: number) => {
                return verticalNext.getAxisY(verticalPrevious.getAxisValue(y))
            }
                       : undefined

        const matches = new Map<RenderItem, RenderItem>()

        const appearedArcs: RenderItem[] = []

        for (const item of queue.queue) {
            if (item.key == null)
                continue

            const old = previous.get(item.key)

            previous.delete(item.key)

            if (old)
                matches.set(item, old)

            if (old?.isGhost && item.isGhost)
                continue

            if (old)
                item.morphFrom(old, duration)
            else if (item.axisValue != null && verticalPrevious)
                item.enterFromAxis(verticalPrevious.getAxisY(item.axisValue), duration)
            else if (item.arc && !item.isGhost)
                appearedArcs.push(item)
            else if (!item.isGhost)
                item.appear(duration, toPrevious)
        }

        const removed = Array.from(previous.values())

        Transition.animateArcs(queue, appearedArcs, removed, matches, duration)

        for (const item of removed) {
            if (item.isGhost || item.arc)
                continue

            if (item.axisValue != null && verticalNext)
                item.leaveToAxis(verticalNext.getAxisY(item.axisValue), duration)
            else
                item.disappear(duration, toNext)

            queue.queue.push(item)
        }
    }

    private static animateArcs(queue: Queue,
                               appeared: RenderItem[],
                               removed: RenderItem[],
                               matches: Map<RenderItem, RenderItem>,
                               duration: number) {
        const epsilon = 1e-9

        const newArcs = queue.queue.filter(item => {
            return item.arc != null
        })
        const newByOld = new Map<RenderItem, RenderItem>()

        for (const [item, old] of matches)
            newByOld.set(old, item)

        const oldArcs = [...matches.values(), ...removed].filter(item => {
            return item.arc != null
        })

        const previousEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const before = newArcs.filter(other => {
                return !visited.has(other) && Math.abs(other.arc.endAngle - item.arc.startAngle) < epsilon
            })

            const matched = before.find(other => {
                return matches.has(other)
            })

            if (matched) {
                const old = matches.get(matched)!

                return old.arc.current(old.animation.morph).endAngle
            }

            return before.length > 0
                   ? previousEnd(before[0], visited)
                   : item.arc.startAngle
        }

        const nextEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const start = item.arc.current(item.animation.morph).startAngle

            const before = oldArcs.filter(other => {
                return !visited.has(other)
                       && Math.abs(other.arc.current(other.animation.morph).endAngle - start) < epsilon
            })

            const matched = before.find(other => {
                return newByOld.has(other)
            })

            if (matched)
                return newByOld.get(matched)!.arc.endAngle

            return before.length > 0
                   ? nextEnd(before[0], visited)
                   : start
        }

        const appearAngles = appeared.map(item => {
            return previousEnd(item, new Set())
        })
        const removeAngles = removed.map(item => {
            return item.arc && !item.isGhost ? nextEnd(item, new Set()) : 0
        })

        appeared.forEach((item, i) => {
            item.appearFromAngle(appearAngles[i], duration)
        })

        removed.forEach((item, i) => {
            if (!item.arc || item.isGhost)
                return

            item.disappearToAngle(removeAngles[i], duration)

            queue.queue.push(item)
        })
    }
}