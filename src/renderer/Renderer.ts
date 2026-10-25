import { getContext } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/Legend'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import Pointer, { ScrollDrag } from '@/renderer/Pointer'
import ProcessFactory from '@/render/ProcessFactory'
import PlotProcess from '@/render/plot/PlotProcess'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import Transition from '@/renderer/Transition'
import CustomTooltip from '@/renderer/CustomTooltip'
import Overlay from '@/renderer/Overlay'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import Layout from '@/renderer/Layout'
import ChartMenu from '@/renderer/ChartMenu'
import { AnimationTiming, Layer } from '@/static/constants/Index'
import Theme from '@/Theme'
import HoverProgress from '@/types/HoverProgress'
import RenderItemScrollbar from '@/types/RenderItemScrollbar'
import { contains } from '@/helpers/Geometry'
import { onImageLoad } from '@/helpers/Images'

export default class Renderer {
    private readonly canvas: HTMLCanvasElement

    private readonly pointer: Pointer

    private readonly queue: Queue

    private readonly tooltip: TooltipOverlay

    private readonly contextMenu = new ContextMenuOverlay()

    private readonly layout = new Layout()

    private readonly menu: ChartMenu

    private readonly tick = (timestamp: DOMHighResTimeStamp) => {
        this.draw(timestamp)
    }

    private frame: number | null = null

    private isApplied: boolean = false

    private isLaidOut: boolean = false

    private isSuspended: boolean = false

    private isClean: boolean = false

    private legend: Legend | undefined

    private panels: Panel[] = []

    private settings: ChartSettings

    private readonly detachImages: () => void

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.queue = new Queue(getContext(this.canvas))
        this.tooltip = new TooltipOverlay(this.canvas)
        this.menu = new ChartMenu(this.canvas, this.queue, point => this.pointer.openMenu(point), () => this.drawClean())
        this.contextMenu.fixedButtons = () => this.menu.getButtons()
        this.detachImages = onImageLoad(() => this.render())

        this.pointer = new Pointer(this.canvas, () => this.layout.window, {
            onClick: (point: Point) => this.onClick(point),
            onChange: () => this.render(),
            canDrag: (point: Point) => !this.pointer.context && !this.getClickableItemAt(point),
            hasContextMenuAt: (point: Point) => !!this.settings.contextMenu?.length
                                                && this.queue.items.some(item => item.hasContextMenuAt(point)),
            scrollBy: (point: Point, delta: number) => this.scrollBy(point, delta),
            getScrollDrag: (point: Point) => this.getScrollDrag(point)
        })
    }

    apply(settings: ChartSettings) {
        this.settings = settings

        this.menu.apply(settings)
        this.syncLegend()

        this.contextMenu.menu = settings.contextMenu

        this.tooltip.custom.hide()
        this.tooltip.isEnabled = settings.enableTooltip
        this.tooltip.template = settings.enableTooltip && settings.templateId
                                ? CustomTooltip.fromTemplate(settings.templateId)
                                : null

        if (!this.isSuspended)
            this.pointer.attach(this.settings.enableMove)

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild(false)

        this.isApplied = true
    }

    private rebuild(isInitialized: boolean) {
        Theme.update(this.settings.isDarkThemeFunction)

        this.queue.clear()

        this.tooltip.clear(this.queue)
        this.contextMenu.clear(this.queue)
        this.legend?.clear(this.queue)
        this.menu.button?.clear(this.queue)

        this.pointer.closeContext()

        if (this.layout.hasArea)
            this.buildChart(isInitialized)
        else
            this.panels = []

        this.render()
    }

    private rebuildAnimated() {
        if (this.settings.staticMode)
            return this.rebuild(true)

        const previous = Transition.snapshot(this.queue)
        const previousPanels = this.panels

        this.rebuild(true)

        Transition.apply(this.queue, previous, previousPanels, this.panels, AnimationTiming.rebuild)
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
            this.rebuild(this.isLaidOut && !this.queue.items.some(item => item.isInitializing))
        else
            this.render()

        this.isLaidOut ||= this.layout.hasArea

        if (this.isSuspended)
            return

        this.cancelFrame()
        this.draw(performance.now())
    }

    destroy() {
        this.pointer.detach()
        this.detachImages()

        this.removeLegend()
        this.menu.remove()

        this.tooltip.custom.hide()
        this.tooltip.template = null

        this.tooltip.clear(this.queue)
        this.contextMenu.clear(this.queue)
        this.queue.clear()

        this.cancelFrame()

        this.panels = []
        this.layout.reset()
        this.isApplied = false
        this.isLaidOut = false
    }

    suspend() {
        this.isSuspended = true

        this.pointer.detach()

        this.tooltip.custom.hide()

        this.cancelFrame()
    }

    resume() {
        this.isSuspended = false

        this.pointer.attach(this.settings.enableMove)

        this.render()
    }

    private syncLegend() {
        if (!this.settings.enableLegend) {
            this.removeLegend()
        } else if (this.legend) {
            this.legend.applySettings(this.settings)
        } else {
            this.legend = new Legend(this.settings)
            this.legend.onChange = () => this.rebuildAnimated()
        }

        this.updateLayout()
    }

    private removeLegend() {
        if (!this.legend)
            return

        this.legend.clear(this.queue)
        this.legend.destroy()
        this.legend = undefined
    }

    render(): void {
        if (this.isSuspended)
            return

        this.frame ??= requestAnimationFrame(this.tick)
    }

    private cancelFrame() {
        if (this.frame == null)
            return

        cancelAnimationFrame(this.frame)
        this.frame = null
    }

    private drawClean() {
        this.isClean = true

        this.cancelFrame()
        this.draw(performance.now())

        this.isClean = false

        this.render()
    }

    private draw(timestamp: DOMHighResTimeStamp) {
        this.frame = null

        Theme.update(this.settings.isDarkThemeFunction)
        HoverProgress.isInstant = this.settings.staticMode || this.isClean

        const { window, screen } = this.layout
        const { context } = this.pointer
        const position = this.isClean ? null : this.pointer.position

        let isAnimating = this.queue.animate(position && !this.contextMenu.isOver(position) ? position : null, timestamp)

        const isLegendMoving = this.legend?.isMoving

        const frame = { queue: this.queue, window, screen, mouse: position, context, now: timestamp }

        for (const overlay of this.overlays)
            isAnimating = overlay.update(frame) || isAnimating

        if (isLegendMoving)
            this.layout.fit(this.legend!.getCurrentReserved(timestamp))

        for (const panel of this.panels) {
            isAnimating = panel.animateScroll(timestamp) || isAnimating

            panel.update(window)
        }

        isAnimating = this.queue.render(timestamp, window, screen) || isAnimating

        if (isAnimating)
            this.render()
    }

    private get overlays(): Overlay[] {
        return [this.tooltip, this.contextMenu, this.legend, this.menu.button].filter(overlay => overlay != undefined)
    }

    private buildChart(isInitialized: boolean) {
        const add = (...actions: QueueAction[]) => {
            const items = QueueItemsBuilder.build(actions, isInitialized || this.settings.staticMode)

            this.queue.add(items)

            return items
        }

        const { charts, columns } = this.settings
        const isMultiple = charts.length > 1
        const previousPanels = this.panels

        this.panels = this.layout.getPanels(charts, columns)

        this.panels.forEach((panel, index) => {
            const chart = charts[index]
            const pixel = panel.pixel(this.layout.window)

            const process = ProcessFactory.create(chart, pixel, this.settings)

            panel.plot = process instanceof PlotProcess ? process : null

            if (process)
                process.onChange = () => this.rebuildAnimated()

            panel.scroll = process?.getScroll() ?? null
            panel.keepScroll(previousPanels[index])

            const isEmpty = !!process?.isEmpty()

            const fixed = add(...(isEmpty ? [] : process?.getFixedData() ?? []), this.layout.getPanelTitle(chart.title, pixel))
            const content = add(...(isEmpty ? [this.layout.getEmpty()] : process?.getData() ?? []))

            for (const item of content)
                item.isScrollable = panel.scroll != null

            for (const item of [...fixed, ...content]) {
                if (!item.isFixed)
                    item.panel = panel

                if (isMultiple) {
                    item.key &&= `${ index }-${ item.key }`
                    item.hoverGroup &&= `${ index }-${ item.hoverGroup }`
                }
            }

            if (panel.scroll)
                this.queue.add([Renderer.getScrollbar(panel)])
        })

        add(this.layout.getTitle())

        this.pointer.setScrollable(this.panels.some(panel => panel.canScroll))
    }

    private static getScrollbar(panel: Panel) {
        const item = new RenderItem(new RenderItemScrollbar(panel))

        item.isFixed = true
        item.layer = Layer.Scrollbar

        return item
    }

    private getScrollablePanel(point: Point) {
        return this.panels.find(panel => panel.canScroll && contains(panel.window, point))
    }

    private scrollBy(point: Point, delta: number): boolean | null {
        const panel = this.getScrollablePanel(point)

        return panel ? panel.glideBy(delta) : null
    }

    private getScrollDrag(point: Point): ScrollDrag | null {
        return this.getScrollablePanel(point)?.getDrag(point) ?? null
    }

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.context != null
        const items = this.queue.items

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i]

            if (item.onClick && !item.isInitializing && (!isContextOpen || item.isMenuButton) && item.in(point)) {
                return item
            }
        }

        return undefined
    }

    private onClick(point: Point) {
        this.getClickableItemAt(point)?.onClick?.()

        this.render()
    }

    private updateLayout() {
        const reserveMenuRow = this.settings.charts.some(chart => ProcessFactory.hasFixedHeader(chart.type))

        return this.layout.update(this.settings.title, this.legend, this.menu.button, reserveMenuRow)
    }
}