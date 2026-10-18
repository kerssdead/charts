import RenderItem from '@/types/RenderItem'
import RenderItemText from '@/types/RenderItemText'
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

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    get items(): readonly RenderItem[] {
        return this.queue
    }

    render(window: CanvasWindow, screen: CanvasWindow = window): boolean {
        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0)

        this.ctx.fillStyle = Theme.canvasBackground
        this.ctx.fillRect(0, 0, screen.width, screen.height)

        let isAnimating = false

        let hasTemp = false

        for (const step of this.getSorted()) {
            this.ctx.save()
            this.ctx.beginPath()

            this.ctx.globalAlpha = step.animation.alpha

            if (step.shape instanceof RenderItemText && !step.color) {
                this.ctx.fillStyle = Theme.text
            }

            step.render(this.ctx, step.isFixed ? screen : window)

            this.ctx.restore()

            if (step.isTemp)
                hasTemp = true
            else if (step.animation.isInitializing || step.animation.isMorphing)
                isAnimating = true
        }

        if (hasTemp)
            this.removeWhere(item => item.isTemp)

        return isAnimating
    }

    animate(point: Point | null) {
        point ??= OUTSIDE

        const hoveredGroups = this.hoveredGroups

        hoveredGroups.clear()

        for (const item of this.queue) {
            if (item.hoverGroup != null && item.isAnimate && !item.isInitializing && item.in(point))
                hoveredGroups.add(item.hoverGroup)
        }

        for (const item of this.queue) {
            item.animate(point, hoveredGroups)
        }
    }

    add(items: RenderItem[]) {
        if (items.length == 0)
            return

        for (const item of items)
            this.queue.push(item)

        this.isSorted = false
    }

    remove(items: ReadonlySet<RenderItem>) {
        if (items.size == 0)
            return

        this.removeWhere(item => items.has(item))
    }

    clear() {
        this.queue = []
        this.isSorted = true
    }

    private removeWhere(predicate: (item: RenderItem) => boolean) {
        let count = 0

        for (const item of this.queue)
            if (!predicate(item))
                this.queue[count++] = item

        this.queue.length = count
    }

    private getSorted() {
        if (!this.isSorted) {
            this.queue.sort((a, b) => { return a.layer - b.layer })
            this.isSorted = true
        }

        return this.queue
    }
}