import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import Panel from '@/types/Panel'
import ValueAxis from '@/types/ValueAxis'
import ArcNeighbours from '@/renderer/ArcNeighbours'
import { ItemFlag as f } from '@/static/ItemFlag'

type ArcChanges = {
    appeared: RenderItem[]
    removed: RenderItem[]
    matches: Map<RenderItem, RenderItem>
}

export default class Transition {
    constructor(
        private readonly queue: Queue,
        private readonly previousPanels: Panel[],
        private readonly panels: Panel[],
        private readonly duration: number
    ) {
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

    private enter(item: RenderItem, old: RenderItem | undefined) {
        if (old?.is(f.Ghost) && item.is(f.Ghost))
            return false

        const previousAxis = Transition.verticalAxis(this.previousPanels, item)
        const nextAxis = Transition.verticalAxis(this.panels, item)

        if (old)
            item.morphFrom(old, this.duration)
        else if (item.axisValue != null && previousAxis)
            item.enterFromAxis(previousAxis.getAxisY(item.axisValue), this.duration)
        else if (Transition.isArc(item) && !item.is(f.Ghost))
            return true
        else if (!item.is(f.Ghost))
            item.appear(this.duration, Transition.mapY(previousAxis, nextAxis))

        return false
    }

    private leave(item: RenderItem) {
        if (item.is(f.Ghost) || Transition.isArc(item))
            return

        const nextAxis = Transition.verticalAxis(this.panels, item)

        item.set(f.Fading, item.is(f.Fading) || !nextAxis)

        if (item.axisValue != null && nextAxis)
            item.leaveToAxis(nextAxis.getAxisY(item.axisValue), this.duration)
        else
            item.disappear(
                this.duration,
                Transition.mapY(nextAxis, Transition.verticalAxis(this.previousPanels, item))
            )

        this.queue.add([item])
    }

    private animateArcs({ appeared, removed, matches }: ArcChanges) {
        const arc = (item: RenderItem) => item.shape as RenderItemArc

        const newArcs = this.queue.items.filter(Transition.isArc)
        const oldArcs = [...matches.values(), ...removed].filter(Transition.isArc)
        const neighbours = new ArcNeighbours(newArcs, oldArcs, matches)

        const appearAngles = appeared.map(item => neighbours.appearAngle(item))
        const removeAngles = removed.map(item => {
            return Transition.isArc(item) && !item.is(f.Ghost) ? neighbours.disappearAngle(item) : 0
        })

        appeared.forEach((item, i) => {
            arc(item).appearFromAngle(appearAngles[i])
            item.morphIn(this.duration)
        })

        removed.forEach((item, i) => {
            if (!Transition.isArc(item) || item.is(f.Ghost))
                return

            arc(item).disappearToAngle(removeAngles[i], item.animation.morph)
            item.morphOut(this.duration)

            this.queue.add([item])
        })
    }

    private static verticalAxis(panels: Panel[], item: RenderItem) {
        const axis = item.panel ? panels[item.panel.index]?.valueAxis : null

        return axis && !axis.isHorizontal ? axis : null
    }

    private static mapY(from: ValueAxis | null, to: ValueAxis | null) {
        return from && to
               ? (y: number) => from.getAxisY(to.getAxisValue(y))
               : undefined
    }

    private static isArc(item: RenderItem) {
        return item.shape instanceof RenderItemArc
    }
}