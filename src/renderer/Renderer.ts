import { getContext } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/Legend'
import Point from '@/types/Point'
import Pointer from '@/renderer/Pointer'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import ProcessFactory from '@/render/ProcessFactory'
import Transition from '@/renderer/Transition'
import AnimationFrame from '@/renderer/AnimationFrame'
import ChartPanels from '@/renderer/ChartPanels'
import Overlay from '@/renderer/Overlay'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import Layout from '@/renderer/Layout'
import ChartMenu from '@/renderer/ChartMenu'
import { AnimationTiming } from '@/static/constants/Index'
import Theme from '@/Theme'
import HoverProgress from '@/types/HoverProgress'
import Frame from '@/types/Frame'
import { onImageLoad } from '@/helpers/Images'

export default class Renderer {
    private readonly pointer: Pointer

    private readonly queue: Queue

    private readonly tooltip: TooltipOverlay

    private readonly contextMenu = new ContextMenuOverlay()

    private readonly layout = new Layout()

    private readonly menu: ChartMenu

    private readonly frame = new AnimationFrame(timestamp => this.guard(() => this.draw(timestamp)))

    private isApplied: boolean = false

    private isLaidOut: boolean = false

    private isSuspended: boolean = false

    private isClean: boolean = false

    private legend: Legend | undefined

    private readonly panels: ChartPanels

    private settings: ChartSettings

    private readonly detachImages: () => void

    private readonly onError: (error: unknown) => void

    constructor(canvas: HTMLCanvasElement, onError: (error: unknown) => void) {
        this.onError = onError
        this.queue = new Queue(getContext(canvas))
        this.panels = new ChartPanels(this.queue, this.layout)
        this.tooltip = new TooltipOverlay(canvas)
        this.menu = new ChartMenu(canvas, this.queue, point => this.pointer.openMenu(point), () => {
            this.drawClean()
        })
        this.contextMenu.fixedButtons = () => this.menu.getButtons()
        this.detachImages = onImageLoad(() => this.render())

        this.pointer = new Pointer(canvas, () => this.layout.window, {
            onClick: (point: Point) => this.guard(() => this.onClick(point)),
            onChange: () => this.render(),
            canDrag: (point: Point) => !this.pointer.context && !this.getClickableItemAt(point),
            hasContextMenuAt: (point: Point) => !!this.settings.contextMenu?.length
                                                && this.queue.items.some(item => item.hasContextMenuAt(point)),
            scrollBy: (point: Point, delta: number) => this.panels.scrollBy(point, delta),
            getScrollDrag: (point: Point) => this.panels.getScrollDrag(point)
        })
    }

    apply(settings: ChartSettings) {
        this.settings = settings

        this.menu.apply(settings)
        this.syncLegend()

        this.contextMenu.menu = settings.contextMenu

        this.tooltip.apply(settings)

        if (!this.isSuspended)
            this.pointer.attach(this.settings.enableMove)

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild({ isInitialized: false })

        this.isApplied = true
    }

    private rebuild({ isInitialized }: { isInitialized: boolean }) {
        Theme.update(this.settings.isDarkThemeFunction)

        this.queue.clear()

        for (const overlay of this.overlays)
            overlay.clear(this.queue)

        this.pointer.closeContext()

        if (this.layout.hasArea) {
            this.panels.build(this.settings, isInitialized, () => this.rebuildAnimated())
            this.pointer.setScrollable(this.panels.canScroll)
        } else {
            this.panels.clear()
        }

        this.render()
    }

    private rebuildAnimated() {
        if (this.settings.staticMode)
            return this.rebuild({ isInitialized: true })

        const previous = Transition.snapshot(this.queue)
        const previousPanels = this.panels.list

        this.rebuild({ isInitialized: true })

        new Transition(this.queue, previousPanels, this.panels.list, AnimationTiming.rebuild).apply(previous)
    }

    resize(width: number, height: number, ratio: number) {
        this.layout.width = width
        this.layout.height = height
        this.menu.ratio = ratio
        this.queue.ratio = ratio

        if (!this.isApplied)
            return

        const isResized = this.updateLayout()

        if (isResized && this.layout.hasArea)
            this.rebuild({ isInitialized: this.isLaidOut && !this.queue.items.some(item => item.isInitializing) })
        else
            this.render()

        this.isLaidOut ||= this.layout.hasArea

        if (this.isSuspended)
            return

        this.frame.cancel()
        this.draw(performance.now())
    }

    destroy() {
        this.pointer.detach()
        this.detachImages()

        this.removeLegend()
        this.menu.remove()

        this.tooltip.reset(this.queue)
        this.contextMenu.clear(this.queue)
        this.queue.clear()

        this.frame.cancel()

        this.panels.clear()
        this.layout.reset()
        this.isApplied = false
        this.isLaidOut = false
    }

    suspend() {
        this.isSuspended = true

        this.pointer.detach()

        this.tooltip.custom.hide()

        this.frame.cancel()
    }

    resume() {
        this.isSuspended = false

        this.pointer.attach(this.settings.enableMove)

        this.render()
    }

    private syncLegend() {
        if (!this.settings.enableLegend)
            this.removeLegend()
        else if (this.legend)
            this.legend.applySettings(this.settings)
        else
            this.legend = new Legend(this.settings, () => this.rebuildAnimated())

        this.updateLayout()
    }

    private removeLegend() {
        this.legend?.destroy(this.queue)
        this.legend = undefined
    }

    render(): void {
        if (this.isSuspended)
            return

        this.frame.request()
    }

    private drawClean() {
        this.isClean = true

        this.frame.cancel()
        this.draw(performance.now())

        this.isClean = false

        this.render()
    }

    private draw(timestamp: DOMHighResTimeStamp) {
        Theme.update(this.settings.isDarkThemeFunction)
        HoverProgress.isInstant = this.settings.staticMode || this.isClean

        const { window, screen } = this.layout
        const { context } = this.pointer
        const position = this.isClean ? null : this.pointer.position
        const movingLegend = this.legend?.isMoving ? this.legend : undefined
        const frame = { queue: this.queue, window, screen, mouse: position, context, now: timestamp }

        let isAnimating = this.queue.animate(this.getHoverPosition(position), timestamp)

        isAnimating = this.updateOverlays(frame) || isAnimating

        if (movingLegend)
            this.layout.fit(movingLegend.getCurrentReserved(timestamp))

        isAnimating = this.panels.animate(timestamp, window) || isAnimating
        isAnimating = this.queue.render(timestamp, window, screen) || isAnimating

        if (isAnimating)
            this.render()
    }

    private updateOverlays(frame: Frame) {
        let isAnimating = false

        for (const overlay of this.overlays)
            isAnimating = overlay.update(frame) || isAnimating

        return isAnimating
    }

    private getHoverPosition(position: Point | null) {
        return position && !this.contextMenu.isOver(position) ? position : null
    }

    private guard(action: () => void) {
        try {
            action()
        } catch (error) {
            this.onError(error)
        }
    }

    private get overlays(): Overlay[] {
        return [this.tooltip, this.contextMenu, this.legend, this.menu.button]
            .filter(overlay => overlay !== undefined)
    }

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.context != null

        return this.queue.findTop(item => item.isClickableAt(point, isContextOpen))
    }

    private onClick(point: Point) {
        this.getClickableItemAt(point)?.onClick?.()

        this.render()
    }

    private updateLayout() {
        const reserveMenuRow = this.settings.charts.some(chart => ProcessFactory.hasFixedHeader(chart.type))

        return this.layout.update({
            title: this.settings.title,
            legend: this.legend,
            menu: this.menu.button,
            reserveMenuRow
        })
    }
}