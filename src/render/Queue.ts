import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import { ThemePalette } from '@/Theme'
import { ItemFlag as f } from '@/static/ItemFlag'
import RenderFrame from '@/types/RenderFrame'
import ItemChanges from '@/render/ItemChanges'
import QueueLayers, { LayerPainter } from '@/render/QueueLayers'

const OUTSIDE: Point = { x: -Infinity, y: -Infinity }

type ItemsPass = {
    window: CanvasWindow
    frame: RenderFrame
    isAnimating: boolean
    hasRemovable: boolean
}

export default class Queue {
    private queue: RenderItem[] = []

    private isSorted = true

    private readonly hoveredGroups = new Set<string>()

    private readonly changes = new ItemChanges()

    private readonly layers = new QueueLayers()

    ratio = 1

    version = 0

    isAnimating = false

    constructor(private readonly ctx: CanvasRenderingContext2D) {
    }

    get items(): readonly RenderItem[] {
        return this.queue
    }

    render(
        now: DOMHighResTimeStamp,
        window: CanvasWindow,
        screen: CanvasWindow,
        theme: ThemePalette,
        canReuseLayers = false
    ): boolean {
        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0)

        const steps = this.getSorted()
        const pass: ItemsPass = {
            window,
            frame: { window, screen, now, theme },
            isAnimating: false,
            hasRemovable: false
        }
        const painter: LayerPainter = {
            background: ctx => Queue.paintBackground(ctx, screen, theme),
            items: (ctx, start, end) => Queue.paintItems(ctx, steps.slice(start, end), pass)
        }

        if (canReuseLayers && !this.isAnimating) {
            this.layers.draw(this.ctx, {
                version: this.version,
                ratio: this.ratio,
                itemCount: steps.length,
                changed: this.changes.findChangedSpan(steps)
            }, painter)
        } else {
            this.layers.invalidate()
            painter.background(this.ctx)
            painter.items(this.ctx, 0, steps.length)
        }

        if (pass.hasRemovable)
            this.removeWhere(item => item.is(f.Removable))

        this.isAnimating = pass.isAnimating

        return pass.isAnimating
    }

    releaseLayers() {
        this.layers.release()
    }

    markChanged() {
        this.version++
    }

    private static paintBackground(ctx: CanvasRenderingContext2D, screen: CanvasWindow, theme: ThemePalette) {
        ctx.globalAlpha = 1
        ctx.fillStyle = theme.canvasBackground
        ctx.fillRect(0, 0, screen.width, screen.height)
    }

    private static paintItems(ctx: CanvasRenderingContext2D, items: RenderItem[], pass: ItemsPass) {
        const { frame } = pass

        for (const item of items) {
            ctx.globalAlpha = item.animation.alpha
            frame.window = item.is(f.Fixed) ? frame.screen : pass.window

            item.render(ctx, frame)

            if (item.is(f.Removable))
                pass.hasRemovable = true
            else if (item.animation.isInitializing || item.animation.isMorphing)
                pass.isAnimating = true
        }
    }

    animate(pointer: Point | null, now: DOMHighResTimeStamp, isInstant = false) {
        const point = pointer ?? OUTSIDE

        const hoveredGroups = this.hoveredGroups

        hoveredGroups.clear()

        const top = this.findTop(item => item.canHoverGroupAt(point))

        if (top?.hoverGroup)
            hoveredGroups.add(top.hoverGroup)

        let isAnimating = false

        this.changes.beginStep()

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i]

            if (item.animate(point, now, hoveredGroups, isInstant)) {
                isAnimating = true
                this.changes.add(item)
            }
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

    findTooltip(point: Point) {
        const items = this.getSorted()

        let best: RenderItem | undefined
        let bestDistance = Infinity

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i]

            if (!item.hasTooltipAt(point))
                continue

            const distance = item.tooltipDistanceAt(point)

            if (distance == null)
                return best ?? item

            if (distance < bestDistance) {
                best = item
                bestDistance = distance
            }
        }

        return best
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
        this.changes.clear()
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