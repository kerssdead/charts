import Queue from '@/render/Queue'
import PlotProcess from '@/render/PlotProcess'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import Panel from '@/types/Panel'

export default class Transition {
    static snapshot(queue: Queue): Map<string, RenderItem> {
        const previous = new Map<string, RenderItem>()

        for (const item of queue.items)
            if (item.key != null && !item.animation.isLeaving && !item.animation.removeAfterMorph)
                previous.set(item.key, item)

        return previous
    }

    static apply(queue: Queue,
                 previous: Map<string, RenderItem>,
                 previousPanels: Panel[],
                 panels: Panel[],
                 duration: number) {
        const vertical = (panels: Panel[], item: RenderItem) => {
            const plot = item.panel ? panels[item.panel.index]?.plot : null

            return plot && !plot.isHorizontal ? plot : null
        }

        const mapY = (from: PlotProcess | null, to: PlotProcess | null) => {
            return from && to
                   ? (y: number) => from.getAxisY(to.getAxisValue(y))
                   : undefined
        }

        const matches = new Map<RenderItem, RenderItem>()

        const appearedArcs: RenderItem[] = []

        for (const item of queue.items) {
            if (item.key == null)
                continue

            const old = previous.get(item.key)

            previous.delete(item.key)

            if (old)
                matches.set(item, old)

            if (old?.isGhost && item.isGhost)
                continue

            const verticalPrevious = vertical(previousPanels, item)

            if (old)
                item.morphFrom(old, duration)
            else if (item.axisValue != null && verticalPrevious)
                item.enterFromAxis(verticalPrevious.getAxisY(item.axisValue), duration)
            else if (Transition.isArc(item) && !item.isGhost)
                appearedArcs.push(item)
            else if (!item.isGhost)
                item.appear(duration, mapY(verticalPrevious, vertical(panels, item)))
        }

        const removed = Array.from(previous.values())

        Transition.animateArcs(queue, appearedArcs, removed, matches, duration)

        for (const item of removed) {
            if (item.isGhost || Transition.isArc(item))
                continue

            const verticalNext = vertical(panels, item)

            if (item.axisValue != null && verticalNext)
                item.leaveToAxis(verticalNext.getAxisY(item.axisValue), duration)
            else
                item.disappear(duration, mapY(verticalNext, vertical(previousPanels, item)))

            queue.add([item])
        }
    }

    private static animateArcs(queue: Queue,
                               appeared: RenderItem[],
                               removed: RenderItem[],
                               matches: Map<RenderItem, RenderItem>,
                               duration: number) {
        const epsilon = 1e-9

        const arc = (item: RenderItem) => item.shape as RenderItemArc

        const newArcs = queue.items.filter(item => {
            return Transition.isArc(item)
        })
        const newByOld = new Map<RenderItem, RenderItem>()

        for (const [item, old] of matches)
            newByOld.set(old, item)

        const oldArcs = [...matches.values(), ...removed].filter(item => {
            return Transition.isArc(item)
        })

        const previousEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const before = newArcs.filter(other => {
                return !visited.has(other)
                       && Transition.isSamePanel(other, item)
                       && Math.abs(arc(other).endAngle - arc(item).startAngle) < epsilon
            })

            const matched = before.find(other => {
                return matches.has(other)
            })

            if (matched) {
                const old = matches.get(matched)!

                return arc(old).current(old.animation.morph).endAngle
            }

            return before.length > 0
                   ? previousEnd(before[0], visited)
                   : arc(item).startAngle
        }

        const nextEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const start = arc(item).current(item.animation.morph).startAngle

            const before = oldArcs.filter(other => {
                return !visited.has(other)
                       && Transition.isSamePanel(other, item)
                       && Math.abs(arc(other).current(other.animation.morph).endAngle - start) < epsilon
            })

            const matched = before.find(other => {
                return newByOld.has(other)
            })

            if (matched)
                return arc(newByOld.get(matched)!).endAngle

            return before.length > 0
                   ? nextEnd(before[0], visited)
                   : start
        }

        const appearAngles = appeared.map(item => {
            return previousEnd(item, new Set())
        })
        const removeAngles = removed.map(item => {
            return Transition.isArc(item) && !item.isGhost ? nextEnd(item, new Set()) : 0
        })

        appeared.forEach((item, i) => {
            arc(item).appearFromAngle(appearAngles[i])
            item.morphIn(duration)
        })

        removed.forEach((item, i) => {
            if (!Transition.isArc(item) || item.isGhost)
                return

            arc(item).disappearToAngle(removeAngles[i], item.animation.morph)
            item.morphOut(duration)

            queue.add([item])
        })
    }

    private static isArc(item: RenderItem) {
        return item.shape instanceof RenderItemArc
    }

    private static isSamePanel(a: RenderItem, b: RenderItem) {
        return a.panel?.index === b.panel?.index
    }
}