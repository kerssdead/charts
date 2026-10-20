import { getContext } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/Legend'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import Pointer from '@/renderer/Pointer'
import ProcessFactory from '@/render/ProcessFactory'
import PlotProcess from '@/render/PlotProcess'
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
import { AnimationTiming } from '@/static/constants/Index'
import Theme from '@/Theme'
import HoverProgress from '@/types/HoverProgress'

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

    private legend: Legend | undefined

    private panels: Panel[] = []

    private settings: ChartSettings

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.queue = new Queue(getContext(this.canvas))
        this.tooltip = new TooltipOverlay(this.canvas)
        this.menu = new ChartMenu(this.canvas, this.queue, point => this.pointer.openMenu(point))
        this.contextMenu.fixedButtons = () => this.menu.getButtons()

        this.pointer = new Pointer(this.canvas, () => this.layout.window, {
            onClick: (point: Point) => this.onClick(point),
            onChange: () => this.render(),
            canDrag: (point: Point) => !this.pointer.context && !this.getClickableItemAt(point)
        })
    }

    apply(settings: ChartSettings) {
        this.settings = settings

        this.menu.apply(settings)
        this.syncLegend()

        this.contextMenu.menu = settings.contextMenu

        this.tooltip.custom?.hide()
        this.tooltip.isEnabled = settings.enableTooltip
        this.tooltip.custom = settings.enableTooltip && settings.templateId
                              ? CustomTooltip.create(this.canvas, settings.templateId)
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
            this.rebuild(this.isLaidOut)
        else
            this.render()

        this.isLaidOut ||= this.layout.hasArea

        this.cancelFrame()
        this.draw(performance.now())
    }

    destroy() {
        this.pointer.detach()

        this.removeLegend()
        this.menu.remove()

        this.tooltip.custom?.hide()
        this.tooltip.custom = null

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

        this.tooltip.custom?.hide()

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

    private draw(timestamp: DOMHighResTimeStamp) {
        this.frame = null

        Theme.update(this.settings.isDarkThemeFunction)
        HoverProgress.isInstant = this.settings.staticMode

        const { window, screen } = this.layout
        const { position, context } = this.pointer

        let isAnimating = this.queue.animate(position && !this.contextMenu.isOver(position) ? position : null, timestamp)

        const isLegendMoving = this.legend?.isMoving

        const frame = { queue: this.queue, window, screen, mouse: position, context, now: timestamp }

        for (const overlay of this.overlays)
            isAnimating = overlay.update(frame) || isAnimating

        if (isLegendMoving)
            this.layout.fit(this.legend!.getCurrentReserved(timestamp))

        for (const panel of this.panels)
            panel.update(window)

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

        this.panels = this.layout.getPanels(charts, columns)

        this.panels.forEach((panel, index) => {
            const chart = charts[index]
            const pixel = panel.pixel(this.layout.window)

            const process = ProcessFactory.create(chart, this.settings, pixel)

            panel.plot = process instanceof PlotProcess ? process : null

            if (process)
                process.onChange = () => this.rebuildAnimated()

            for (const item of add(...(process?.isEmpty() ? [this.layout.getEmpty()] : process?.getData() ?? []), this.layout.getPanelTitle(chart.title, pixel))) {
                if (!item.isFixed)
                    item.panel = panel

                if (isMultiple) {
                    item.key &&= `${ index }-${ item.key }`
                    item.hoverGroup &&= `${ index }-${ item.hoverGroup }`
                }
            }
        })

        add(this.layout.getTitle())
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
        return this.layout.update(this.settings.title, this.legend, this.menu.button)
    }
}