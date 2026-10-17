import Canvas from 'helpers/Canvas'
import CanvasWindow from 'types/CanvasWindow'
import ChartSettings from 'types/ChartSettings'
import Debug from 'Debug'
import Legend from 'Legend'
import Paddings from 'types/Paddings'
import Panel from 'types/Panel'
import Point from 'types/Point'
import Pointer from 'renderer/Pointer'
import ProcessFactory from 'render/ProcessFactory'
import Queue from 'render/Queue'
import RenderItem from 'types/RenderItem'
import Transition from 'renderer/Transition'
import CustomTooltip from 'renderer/CustomTooltip'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import MenuButton from 'renderer/MenuButton'
import ButtonOptions from 'types/ButtonOptions'
import Export from 'Export'
import Modal from 'Modal'
import Decomposition from 'Decomposition'
import TextResources from 'static/TextResources'
import { Animations, ContextMenu, COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import { TextAlignment } from 'static/Enums'

export class Renderer {
    private static readonly idleDelay = 1000

    private static readonly titleFont = 20

    private static readonly titlePadding = 12

    private static readonly panelTitleFont = 16

    private static readonly panelTitlePadding = 8

    static timer: DOMHighResTimeStamp = 0

    private readonly canvas: HTMLCanvasElement

    private readonly pointer: Pointer

    private readonly queue: Queue

    private readonly tick = (timestamp: DOMHighResTimeStamp) => {
        this.draw(timestamp)
    }

    private activeUntil: DOMHighResTimeStamp = 0

    private frame: number | null = null

    private isApplied: boolean = false

    private isLaidOut: boolean = false

    private legend: Legend | undefined

    private menu: MenuButton | undefined

    private customTooltip: CustomTooltip | null = null

    private panels: Panel[] = []

    private screen: CanvasWindow

    private settings: ChartSettings

    private window: CanvasWindow

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))
        this.window = new CanvasWindow(this.canvas.width, this.canvas.height)

        this.pointer = new Pointer(this.canvas, () => this.window, {
            onClick: (point: Point) => this.onClick(point),
            onChange: () => this.render(),
            canDrag: (point: Point) => !this.pointer.isContextOpen && !this.getClickableItemAt(point)
        })
    }

    apply(settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)

        this.settings = settings

        this.syncMenu()
        this.syncLegend()

        this.customTooltip?.hide()
        this.customTooltip = settings.enableTooltip && settings.templateId
                             ? CustomTooltip.create(this.canvas, settings.templateId)
                             : null

        this.pointer.attach(this.settings.enableMove)

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild(false)

        this.isApplied = true
    }

    private rebuild(isInitialized: boolean) {
        this.queue.destroy()

        this.legend?.clear(this.queue)
        this.menu?.clear(this.queue)

        this.pointer.closeContext()

        this.buildChart(isInitialized)

        this.render()
    }

    private rebuildAnimated() {
        const previous = Transition.snapshot(this.queue)
        const previousPanels = this.panels

        this.rebuild(true)

        Transition.apply(this.queue, previous, previousPanels, this.panels, Animations.rebuild)
    }

    resize(width: number, height: number) {
        if (!this.isApplied)
            return

        const isResized = this.layout(width, height)

        const hasArea = this.window.width > 0 && this.window.height > 0

        if (isResized && hasArea)
            this.rebuild(this.isLaidOut)
        else
            this.render()

        this.isLaidOut ||= hasArea

        this.cancelFrame()
        this.draw(performance.now())
    }

    destroy() {
        this.pointer.detach()

        this.removeLegend()
        this.removeMenu()

        this.customTooltip?.hide()
        this.customTooltip = null

        this.queue.destroy()

        this.cancelFrame()

        this.panels = []
        this.window = new CanvasWindow(this.canvas.width, this.canvas.height)
        this.isApplied = false
        this.isLaidOut = false
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

        this.layout(this.canvas.width, this.canvas.height)
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

        return [
            new ButtonOptions(TextResources.exportPNG, () => {
                setTimeout(() => Export.asPng(this.canvas, title, this.menu?.bounds), ContextMenu.fadeDuration)
            }),
            new ButtonOptions(TextResources.exportCSV, () => {
                Export.asCsv(Decomposition.fromCharts(charts), title)
            }),
            ButtonOptions.divider(),
            new ButtonOptions(TextResources.decomposeToTable, () => {
                new Modal(Decomposition.fromCharts(charts), undefined, title || TextResources.dataAsTable).open()
            })
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
        this.activeUntil = performance.now() + Renderer.idleDelay

        this.requestFrame()
    }

    private requestFrame() {
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

        Renderer.timer = timestamp

        const { position, isContextOpen, contextPoint } = this.pointer

        this.queue.animate(position)

        this.queue.tooltip(this.window, this.settings.enableTooltip ? position : null, isContextOpen, this.customTooltip)
        this.queue.contextMenu(this.window, contextPoint, position, isContextOpen, this.settings.contextMenu,
            this.pointer.isMenu ? this.getMenuButtons() : undefined)

        const isLegendMoving = this.legend?.isMoving

        this.legend?.build(this.queue, position)
        this.menu?.build(this.queue, position)

        if (isLegendMoving)
            this.fit(this.legend!.currentReserved)

        for (const panel of this.panels)
            panel.update(this.window)

        const isAnimating = this.queue.render(this.window, this.screen)

        if (timestamp < this.activeUntil || isAnimating)
            this.requestFrame()
    }

    private buildChart(isInitialized: boolean) {
        const add = (...actions: ((items: QueueItemsBuilder) => void)[]) => {
            return isInitialized || this.settings.disableInitAnimation
                   ? this.queue.addInitialized(...actions)
                   : this.queue.add(...actions)
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
        const { x, y } = this.window.pixel

        const width = COORDS_MAX_X / x
        const height = COORDS_MAX_Y / y

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
                 .position(COORDS_MAX_X / 2 + Renderer.panelTitleFont / 2 * pixel.x, -this.panelTitleHeight / 2 * pixel.y)
                 .size(Renderer.panelTitleFont)
                 .align(TextAlignment.Center)
                 .key('panel-title')
                 .init(Animations.title, 0, true)
        }
    }

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.isContextOpen
        const items = this.queue.queue

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

    private get titleHeight() {
        return this.settings.title || this.menu ? Renderer.titleFont + Renderer.titlePadding * 2 : 0
    }

    private getTitle() {
        const { title } = this.settings
        const { width, height } = this.canvas

        if (!title)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.text(title)
                 .position((width + Renderer.titleFont) / 2 * COORDS_MAX_X / width, this.titleHeight / 2 * COORDS_MAX_Y / height)
                 .size(Renderer.titleFont)
                 .align(TextAlignment.Center)
                 .fixed()
                 .key('title')
                 .init(Animations.title, 0, true)
        }
    }

    private layout(width: number, height: number): boolean {
        this.legend?.resize(width, height, this.titleHeight)
        this.menu?.resize(width, height, this.titleHeight)

        this.screen = new CanvasWindow(this.canvas.width, this.canvas.height)

        return this.fit(this.legend?.reserved ?? { left: 0, top: 0, right: 0, bottom: 0 })
    }

    private fit({ left, top, right, bottom }: Paddings): boolean {
        const { width: canvasWidth, height: canvasHeight } = this.canvas

        top += this.titleHeight

        return this.window.fit(left, top,
            Math.max(canvasWidth - left - right, 0),
            Math.max(canvasHeight - top - bottom, 0))
    }
}