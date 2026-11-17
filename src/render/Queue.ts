import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import { ThemePalette } from '@/Theme'
import { ItemFlag as f } from '@/static/ItemFlag'

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

    render(
        now: DOMHighResTimeStamp,
        window: CanvasWindow,
        screen: CanvasWindow,
        theme: ThemePalette
    ): boolean {
        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0)

        this.ctx.globalAlpha = 1
        this.ctx.fillStyle = theme.canvasBackground
        this.ctx.fillRect(0, 0, screen.width, screen.height)

        let isAnimating = false

        let hasRemovable = false

        const steps = this.getSorted()
        const frame = { window, screen, now, theme }

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]

            this.ctx.globalAlpha = step.animation.alpha
            frame.window = step.is(f.Fixed) ? screen : window

            step.render(this.ctx, frame)

            if (step.is(f.Removable))
                hasRemovable = true
            else if (step.animation.isInitializing || step.animation.isMorphing)
                isAnimating = true
        }

        if (hasRemovable)
            this.removeWhere(item => item.is(f.Removable))

        this.isAnimating = isAnimating

        return isAnimating
    }

    animate(pointer: Point | null, now: DOMHighResTimeStamp, isInstant: boolean = false): boolean {
        const point = pointer ?? OUTSIDE

        const hoveredGroups = this.hoveredGroups

        hoveredGroups.clear()

        const top = this.findTop(item => item.canHoverGroupAt(point))

        if (top?.hoverGroup)
            hoveredGroups.add(top.hoverGroup)

        let isAnimating = false

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].animate(point, now, hoveredGroups, isInstant))
                isAnimating = true
        }

        return isAnimating
    }

    findTop(predicate: (item: RenderItem) => boolean) {
        const items = this.getSorted()

        for (let i = items.length - 1; i >= 0; i--)
            if (predicate(items[i]))
                return items[i]

        return undefined
    }

    add(items: RenderItem[]) {
        if (items.length === 0)
            return

        for (const item of items)
            this.queue.push(item)

        this.isSorted = false
        this.version++
    }

    remove(items: ReadonlySet<RenderItem>) {
        if (items.size === 0)
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

        if (count !== this.queue.length)
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