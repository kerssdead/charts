import Canvas from 'helpers/Canvas'
import CanvasWindow from 'types/CanvasWindow'
import ChartSettings from 'types/ChartSettings'
import Debug from 'Debug'
import Legend from 'Legend'
import PlotProcess from 'render/PlotProcess'
import Paddings from 'types/Paddings'
import Point from 'types/Point'
import Pointer from 'renderer/Pointer'
import ProcessFactory from 'render/ProcessFactory'
import Queue from 'render/Queue'
import RenderItem from 'types/RenderItem'
import Transition from 'renderer/Transition'
import CustomTooltip from 'renderer/CustomTooltip'
import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import { Animations, COORDS_MAX_X, COORDS_MAX_Y } from 'static/constants/Index'
import { TextAlignment } from 'static/Enums'

export class Renderer {
    private static readonly idleDelay = 1000

    private static readonly titleFont = 20

    private static readonly titlePadding = 12

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

    private customTooltip: CustomTooltip | null = null

    private plot: PlotProcess | null = null

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

        this.pointer.closeContext()

        this.buildChart(isInitialized)

        this.render()
    }

    private rebuildAnimated() {
        const previous = Transition.snapshot(this.queue)
        const previousPlot = this.plot

        this.rebuild(true)

        Transition.apply(this.queue, previous, previousPlot, this.plot, Animations.rebuild)
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

        this.customTooltip?.hide()
        this.customTooltip = null

        this.queue.destroy()

        this.cancelFrame()

        this.plot = null
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
        this.queue.contextMenu(this.window, contextPoint, position, isContextOpen, this.settings.contextMenu)

        const isLegendMoving = this.legend?.isMoving

        this.legend?.build(this.queue, position)

        if (isLegendMoving)
            this.fit(this.legend!.currentReserved)

        const isAnimating = this.queue.render(this.window, this.screen)

        if (timestamp < this.activeUntil || isAnimating)
            this.requestFrame()
    }

    private buildChart(isInitialized: boolean) {
        const { actions, plot } = ProcessFactory.create(this.settings, this.window.pixel)

        actions.push(this.getTitle())

        this.plot = plot

        if (isInitialized || this.settings.disableInitAnimation)
            this.queue.addInitialized(...actions)
        else
            this.queue.add(...actions)
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
        return this.settings.title ? Renderer.titleFont + Renderer.titlePadding * 2 : 0
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