import Queue from '@/render/Queue'
import PlotProcess from '@/render/plot/PlotProcess'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import Panel from '@/types/Panel'
import { firstMappedValue, groupBy } from '@/helpers/Collections'

const ANGLE_EPSILON = 1e-9

type ArcChanges = {
    appeared: RenderItem[]
    removed: RenderItem[]
    matches: Map<RenderItem, RenderItem>
}

export default class Transition {
    private readonly queue: Queue

    private readonly previousPanels: Panel[]

    private readonly panels: Panel[]

    private readonly duration: number

    constructor(queue: Queue, previousPanels: Panel[], panels: Panel[], duration: number) {
        this.queue = queue
        this.previousPanels = previousPanels
        this.panels = panels
        this.duration = duration
    }

    static snapshot(queue: Queue): Map<string, RenderItem> {
        const previous = new Map<string, RenderItem>()

        for (const item of queue.items)
            if (item.key != null && !item.animation.isLeaving && !item.animation.removeAfterMorph)
                previous.set(item.key, item)

        return previous
    }

    apply(previous: Map<string, RenderItem>) {
        const matches = new Map<RenderItem, RenderItem>()

        const appeared: RenderItem[] = []

        for (const item of this.queue.items) {
            if (item.key == null)
                continue

            const old = previous.get(item.key)

            previous.delete(item.key)

            if (old)
                matches.set(item, old)

            if (this.enter(item, old))
                appeared.push(item)
        }

        const removed = Array.from(previous.values())

        for (const item of removed)
            if (item.panel)
                item.panel = this.panels[item.panel.index] ?? item.panel

        this.animateArcs({ appeared, removed, matches })

        for (const item of removed)
            this.leave(item)
    }

    private enter(item: RenderItem, old: RenderItem | undefined): boolean {
        if (old?.isGhost && item.isGhost)
            return false

        const verticalPrevious = Transition.verticalPlot(this.previousPanels, item)
        const verticalNext = Transition.verticalPlot(this.panels, item)

        if (old)
            item.morphFrom(old, this.duration)
        else if (item.axisValue != null && verticalPrevious)
            item.enterFromAxis(verticalPrevious.getAxisY(item.axisValue), this.duration)
        else if (Transition.isArc(item) && !item.isGhost)
            return true
        else if (!item.isGhost)
            item.appear(this.duration, Transition.mapY(verticalPrevious, verticalNext))

        return false
    }

    private leave(item: RenderItem) {
        if (item.isGhost || Transition.isArc(item))
            return

        const verticalNext = Transition.verticalPlot(this.panels, item)

        item.isFading ||= !verticalNext

        if (item.axisValue != null && verticalNext)
            item.leaveToAxis(verticalNext.getAxisY(item.axisValue), this.duration)
        else
            item.disappear(
                this.duration,
                Transition.mapY(verticalNext, Transition.verticalPlot(this.previousPanels, item))
            )

        this.queue.add([item])
    }

    private animateArcs({ appeared, removed, matches }: ArcChanges) {
        const arc = (item: RenderItem) => item.shape as RenderItemArc

        const newArcs = this.queue.items.filter(Transition.isArc)
        const newByOld = new Map<RenderItem, RenderItem>()

        for (const [item, old] of matches)
            newByOld.set(old, item)

        const oldArcs = [...matches.values(), ...removed].filter(Transition.isArc)

        const key = (item: RenderItem, angle: number) => {
            return `${ item.panel?.index }|${ Math.round(angle / ANGLE_EPSILON) }`
        }

        const newByEnd = groupBy(newArcs, item => key(item, arc(item).endAngle))
        const oldByEnd = groupBy(oldArcs, item => key(item, arc(item).current(item.animation.morph).endAngle))

        const previousEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const start = arc(item).startAngle

            const before = (newByEnd.get(key(item, start)) ?? []).filter(other => !visited.has(other))

            const old = firstMappedValue(before, matches)

            if (old)
                return arc(old).current(old.animation.morph).endAngle

            return before.length > 0
                   ? previousEnd(before[0], visited)
                   : start
        }

        const nextEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const start = arc(item).current(item.animation.morph).startAngle

            const before = (oldByEnd.get(key(item, start)) ?? []).filter(other => !visited.has(other))

            const matchedNew = firstMappedValue(before, newByOld)

            if (matchedNew)
                return arc(matchedNew).endAngle

            return before.length > 0
                   ? nextEnd(before[0], visited)
                   : start
        }

        const appearAngles = appeared.map(item => previousEnd(item, new Set()))
        const removeAngles = removed.map(item => {
            return Transition.isArc(item) && !item.isGhost ? nextEnd(item, new Set()) : 0
        })

        appeared.forEach((item, i) => {
            arc(item).appearFromAngle(appearAngles[i])
            item.morphIn(this.duration)
        })

        removed.forEach((item, i) => {
            if (!Transition.isArc(item) || item.isGhost)
                return

            arc(item).disappearToAngle(removeAngles[i], item.animation.morph)
            item.morphOut(this.duration)

            this.queue.add([item])
        })
    }

    private static verticalPlot(panels: Panel[], item: RenderItem) {
        const plot = item.panel ? panels[item.panel.index]?.plot : null

        return plot && !plot.isHorizontal ? plot : null
    }

    private static mapY(from: PlotProcess | null, to: PlotProcess | null) {
        return from && to
               ? (y: number) => from.getAxisY(to.getAxisValue(y))
               : undefined
    }

    private static isArc(item: RenderItem) {
        return item.shape instanceof RenderItemArc
    }
}