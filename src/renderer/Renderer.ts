import Canvas from '@/helpers/Canvas'
import CanvasWindow from '@/types/CanvasWindow'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/Legend'
import Paddings, { NO_PADDINGS } from '@/types/Paddings'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import Pointer from '@/renderer/Pointer'
import ProcessFactory from '@/render/ProcessFactory'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import Transition from '@/renderer/Transition'
import CustomTooltip from '@/renderer/CustomTooltip'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import MenuButton from '@/renderer/MenuButton'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import ButtonOptions, { DIVIDER } from '@/types/ButtonOptions'
import Export from '@/Export'
import Modal from '@/Modal'
import Decomposition from '@/Decomposition'
import TextResources from '@/static/TextResources'
import { AnimationTiming, ContextMenu, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import Theme from '@/Theme'

// todo: split class

export class Renderer {
    private static readonly titleFont = 20

    private static readonly titlePadding = 12

    private static readonly panelTitleFont = 16

    private static readonly panelTitlePadding = 8

    private readonly canvas: HTMLCanvasElement

    private readonly pointer: Pointer

    private readonly queue: Queue

    private readonly tooltip: TooltipOverlay

    private readonly contextMenu = new ContextMenuOverlay()

    private readonly tick = (timestamp: DOMHighResTimeStamp) => {
        this.draw(timestamp)
    }

    private width: number = 0

    private height: number = 0

    private ratio: number = 1

    private frame: number | null = null

    private isApplied: boolean = false

    private isLaidOut: boolean = false

    private isSuspended: boolean = false

    private legend: Legend | undefined

    private menu: MenuButton | undefined

    private customTooltip: CustomTooltip | null = null

    private menuButtons: ButtonOptions[] | undefined

    private panels: Panel[] = []

    private screen: CanvasWindow

    private settings: ChartSettings

    private window: CanvasWindow

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))
        this.tooltip = new TooltipOverlay(this.canvas)
        this.window = new CanvasWindow(this.width, this.height)

        this.pointer = new Pointer(this.canvas, () => this.window, {
            onClick: (point: Point) => this.onClick(point),
            onChange: () => this.render(),
            canDrag: (point: Point) => !this.pointer.isContextOpen && !this.getClickableItemAt(point)
        })
    }

    apply(settings: ChartSettings) {
        this.settings = settings
        this.menuButtons = undefined

        this.syncMenu()
        this.syncLegend()

        this.customTooltip?.hide()
        this.customTooltip = settings.enableTooltip && settings.templateId
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
        this.menu?.clear(this.queue)

        this.pointer.closeContext()

        if (this.hasArea)
            this.buildChart(isInitialized)
        else
            this.panels = []

        this.render()
    }

    private rebuildAnimated() {
        const previous = Transition.snapshot(this.queue)
        const previousPanels = this.panels

        this.rebuild(true)

        Transition.apply(this.queue, previous, previousPanels, this.panels, AnimationTiming.rebuild)
    }

    resize(width: number, height: number, ratio: number) {
        this.width = width
        this.height = height
        this.ratio = ratio
        this.queue.ratio = ratio

        if (!this.isApplied)
            return

        const isResized = this.layout(width, height)

        if (isResized && this.hasArea)
            this.rebuild(this.isLaidOut)
        else
            this.render()

        this.isLaidOut ||= this.hasArea

        this.cancelFrame()
        this.draw(performance.now())
    }

    destroy() {
        this.pointer.detach()

        this.removeLegend()
        this.removeMenu()

        this.customTooltip?.hide()
        this.customTooltip = null

        this.tooltip.clear(this.queue)
        this.contextMenu.clear(this.queue)
        this.queue.clear()

        this.cancelFrame()

        this.panels = []
        this.window = new CanvasWindow(this.width, this.height)
        this.isApplied = false
        this.isLaidOut = false
    }

    suspend() {
        this.isSuspended = true

        this.pointer.detach()

        this.customTooltip?.hide()

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

        this.layout(this.width, this.height)
    }

    private syncMenu() {
        if (this.settings.disableInteractions) {
            this.removeMenu()
        } else if (!this.menu) {
            this.menu = new MenuButton()
            this.menu.onClick = () => {
                const bounds = this.menu?.bounds

                if (bounds)
                    this.pointer.openMenu({ x: bounds.right, y: bounds.bottom })
            }
        }
    }

    private removeMenu() {
        this.menu?.clear(this.queue)
        this.menu = undefined
    }

    private getMenuButtons() {
        const { title, charts } = this.settings

        return this.menuButtons ??= [
            {
                text: TextResources.exportPNG,
                action: () => {
                    setTimeout(() => Export.asPng(this.canvas, this.ratio, title, this.menu?.bounds, this.settings.isDarkThemeFunction), ContextMenu.fadeDuration)
                }
            },
            {
                text: TextResources.exportCSV,
                action: () => Export.asCsv(charts, title)
            },
            DIVIDER,
            {
                text: TextResources.decomposeToTable,
                action: () => new Modal(Decomposition.fromCharts(charts), undefined, title || TextResources.dataAsTable).open()
            }
        ]
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

        const { position, isContextOpen, contextPoint } = this.pointer

        const isHovering = this.queue.animate(position && !this.contextMenu.isOver(position) ? position : null, timestamp)

        const isTooltipFading = this.tooltip.update(this.queue, this.window, this.settings.enableTooltip ? position : null, isContextOpen,
            this.customTooltip, timestamp)
        const isMenuAnimating = this.contextMenu.update(this.queue, this.window, contextPoint, position, isContextOpen,
            this.settings.contextMenu, timestamp, this.pointer.isMenu ? this.getMenuButtons() : undefined)

        const isLegendMoving = this.legend?.isMoving

        const isLegendAnimating = this.legend?.build(this.queue, position, timestamp) ?? false
        const isButtonAnimating = this.menu?.build(this.queue, position, timestamp) ?? false

        if (isLegendMoving)
            this.fit(this.legend!.getCurrentReserved(timestamp))

        for (const panel of this.panels)
            panel.update(this.window)

        const isAnimating = this.queue.render(timestamp, this.window, this.screen)

        if (isAnimating || isHovering || isTooltipFading || isMenuAnimating || isLegendAnimating || isButtonAnimating)
            this.render()
    }

    private buildChart(isInitialized: boolean) {
        const add = (...actions: QueueAction[]) => {
            const items = QueueItemsBuilder.build(actions, isInitialized || this.settings.disableInitAnimation)

            this.queue.add(items)

            return items
        }

        const { charts } = this.settings
        const isMultiple = charts.length > 1

        this.panels = this.getPanels()

        this.panels.forEach((panel, index) => {
            const chart = charts[index]
            const pixel = panel.pixel(this.window)

            const { actions, plot } = ProcessFactory.create({ ...this.settings, type: chart.type, data: chart.data }, pixel)

            panel.plot = plot

            for (const item of add(...actions, this.getPanelTitle(chart.title, pixel))) {
                if (!item.isFixed)
                    item.panel = panel

                if (isMultiple) {
                    item.key &&= `${ index }-${ item.key }`
                    item.hoverGroup &&= `${ index }-${ item.hoverGroup }`
                }
            }
        })

        add(this.getTitle())
    }

    private getPanels() {
        const { charts, columns } = this.settings

        const width = this.window.baseWidth
        const height = this.window.baseHeight

        const titles = charts.map(chart => chart.title ? this.panelTitleHeight : 0)

        const panels = Panel.grid(titles, width, height, columns)

        for (const panel of panels)
            panel.update(this.window)

        return panels
    }

    private get panelTitleHeight() {
        return Renderer.panelTitleFont + Renderer.panelTitlePadding * 2
    }

    private getPanelTitle(title: string | undefined, pixel: Point) {
        if (!title)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.text(title)
                 .position(COORDS_MAX_X / 2, -this.panelTitleHeight / 2 * pixel.y)
                 .size(Renderer.panelTitleFont)
                 .align(TextAlignment.Center)
                 .key('panel-title')
                 .init(AnimationTiming.title, 0, true)
        }
    }

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.isContextOpen
        const items = this.queue.items

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i]

            if (item.onClick && (!isContextOpen || item.isContextMenu) && item.in(point)) {
                return item
            }
        }

        return undefined
    }

    private onClick(point: Point) {
        this.getClickableItemAt(point)?.onClick?.()

        this.render()
    }

    private get hasArea() {
        return this.window.width > 0 && this.window.height > 0
    }

    private get titleHeight() {
        return this.settings.title || this.menu ? Renderer.titleFont + Renderer.titlePadding * 2 : 0
    }

    private getTitle() {
        const { title } = this.settings
        const { height } = this

        if (!title)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.text(title)
                 .position(COORDS_MAX_X / 2, this.titleHeight / 2 * COORDS_MAX_Y / height)
                 .size(Renderer.titleFont)
                 .align(TextAlignment.Center)
                 .fixed()
                 .key('title')
                 .init(AnimationTiming.title, 0, true)
        }
    }

    private layout(width: number, height: number): boolean {
        this.legend?.resize(width, height, this.titleHeight)
        this.menu?.resize(width, height, this.titleHeight)

        this.screen = new CanvasWindow(this.width, this.height)

        return this.fit(this.legend?.reserved ?? NO_PADDINGS)
    }

    private fit({ left, top, right, bottom }: Paddings): boolean {
        const { width: canvasWidth, height: canvasHeight } = this

        top += this.titleHeight

        return this.window.fit(left, top,
            Math.max(canvasWidth - left - right, 0),
            Math.max(canvasHeight - top - bottom, 0))
    }
}