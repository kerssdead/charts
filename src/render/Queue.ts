import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import Theme from '@/Theme'

const OUTSIDE: Point = { x: -Infinity, y: -Infinity }

export default class Queue {
    private queue: RenderItem[] = []

    private readonly ctx: CanvasRenderingContext2D

    private isSorted: boolean = true

    private readonly hoveredGroups = new Set<string>()

    ratio: number = 1

    version: number = 0

    isAnimating: boolean = false

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    get items(): readonly RenderItem[] {
        return this.queue
    }

    render(now: DOMHighResTimeStamp, window: CanvasWindow, screen: CanvasWindow = window): boolean {
        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0)

        this.ctx.globalAlpha = 1
        this.ctx.fillStyle = Theme.canvasBackground
        this.ctx.fillRect(0, 0, screen.width, screen.height)

        let isAnimating = false

        let hasTemp = false

        for (const step of this.getSorted()) {
            this.ctx.globalAlpha = step.animation.alpha

            step.render(this.ctx, step.isFixed ? screen : window, screen, now)

            if (step.isTemp)
                hasTemp = true
            else if (step.animation.isInitializing || step.animation.isMorphing)
                isAnimating = true
        }

        if (hasTemp)
            this.removeWhere(item => item.isTemp)

        this.isAnimating = isAnimating

        return isAnimating
    }

    animate(point: Point | null, now: DOMHighResTimeStamp): boolean {
        point ??= OUTSIDE

        const hoveredGroups = this.hoveredGroups

        hoveredGroups.clear()

        for (const item of this.queue) {
            if (item.hoverGroup != null && item.isInteractive && !item.isInitializing && item.in(point))
                hoveredGroups.add(item.hoverGroup)
        }

        let isAnimating = false

        for (const item of this.queue) {
            if (item.animate(point, now, hoveredGroups))
                isAnimating = true
        }

        return isAnimating
    }

    add(items: RenderItem[]) {
        if (items.length == 0)
            return

        this.queue.push(...items)

        this.isSorted = false
        this.version++
    }

    remove(items: ReadonlySet<RenderItem>) {
        if (items.size == 0)
            return

        this.removeWhere(item => items.has(item))
    }

    clear() {
        this.queue = []
        this.isSorted = true
        this.version++
    }

    private removeWhere(predicate: (item: RenderItem) => boolean) {
        let count = 0

        for (const item of this.queue)
            if (!predicate(item))
                this.queue[count++] = item

        if (count != this.queue.length)
            this.version++

        this.queue.length = count
    }

    private getSorted() {
        if (!this.isSorted) {
            this.queue.sort((a, b) => a.layer - b.layer)
            this.isSorted = true
        }

        return this.queue
    }
}