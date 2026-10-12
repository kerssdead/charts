import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import Point from 'types/Point'
import { ChartType, Events } from 'static/Enums'
import Debug from '../Debug'
import CanvasWindow from '../types/CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y, ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import RenderItem from '../types/RenderItem'
import PlotProcess from './PlotProcess'
import Data from '../types/interfaces/Data'
import PlotData from '../types/data/PlotData'
import ChartSettings from '../types/ChartSettings'
import PieProcess from './PieProcess'
import PieData from '../types/data/PieData'
import TreeProcess from './TreeProcess'
import TreeData from '../types/data/TreeData'
import GaugeProcess from './GaugeProcess'
import GaugeData from '../types/data/GaugeData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'

// todo: add tooltips
// todo: add init animation
// todo: add legend ?

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    static timer: DOMHighResTimeStamp = 0

    private queue: Queue

    private window: CanvasWindow

    private moveStartPosition: Point | null

    private moveStartWindow: Point | null

    private currentMousePoint: Point | null

    private contextMenuPoint: Point | null

    private isOpenContext: boolean = false

    private readonly canvas: HTMLCanvasElement

    private readonly settings: ChartSettings

    /**
     * Width of single char in absolute coordinates
     */
    private get charPrecision() {
        const maxWidthPerSymbol = 1.0140625
        const maxCountOfSymbols = this.window.width / maxWidthPerSymbol * this.window.zoomValue

        return RenderItem.reAdjustX(this.window, COORDS_MAX_X / maxCountOfSymbols)
    }

    constructor(canvas: HTMLCanvasElement,
                settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)

        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))

        this.calculateWindow()

        this.settings = settings

        if (settings.enableMove) {
            this.canvas.addEventListener(Events.MouseDown, ev => this.onMouseDown(ev))
            document.addEventListener(Events.MouseMove, ev => this.onMouseMove(ev))
            document.addEventListener(Events.MouseUp, _ => this.onMouseUp())

            this.canvas.addEventListener(Events.Wheel, ev => this.onWheel(ev))
        }

        this.canvas.addEventListener(Events.MouseMove, ev => this.onMouseMove2(ev))
        this.canvas.addEventListener(Events.ContextMenu, ev => this.onContextMenu(ev))
        this.canvas.addEventListener(Events.Click, ev => this.onMouseClick(ev))

        document.addEventListener(Events.Click, ev => this.onContextMenuClick(ev))

        this.canvas.addEventListener(Events.MouseMove, ev => this.DEBUGonMouseMove(ev))
    }

    destroy() {
        this.canvas.removeEventListener(Events.MouseDown, ev => this.onMouseDown(ev))
        document.removeEventListener(Events.MouseMove, ev => this.onMouseMove(ev))
        document.removeEventListener(Events.MouseUp, _ => this.onMouseUp())
        this.canvas.removeEventListener(Events.Wheel, ev => this.onWheel(ev))
        this.canvas.removeEventListener(Events.MouseMove, ev => this.onMouseMove2(ev))
        this.canvas.removeEventListener(Events.ContextMenu, ev => this.onContextMenu(ev))
        this.canvas.removeEventListener(Events.Click, ev => this.onMouseClick(ev))
        document.removeEventListener(Events.Click, ev => this.onContextMenuClick(ev))

        this.canvas.removeEventListener(Events.MouseMove, ev => this.DEBUGonMouseMove(ev))
    }

    render(): void {
        DefaultRenderer.timer = performance.now()

        this.queue.animate(this.currentMousePoint)

        this.queue.tooltip(this.window, this.currentMousePoint, this.isOpenContext)
        this.queue.contextMenu(this.window, this.contextMenuPoint, this.isOpenContext)

        // todo: exclude render not in CanvasWindow
        this.queue.render(this.window)

        // todo: if canvas is need to re-render
        requestAnimationFrame(this.render.bind(this))
    }

    add(type: ChartType, ...data: Data[]) {
        for (const item of data) {
            switch (type) {
                case ChartType.Plot:
                    let plotProcess = new PlotProcess(item as PlotData, this.charPrecision)

                    this.queue.add(plotProcess.getTitles(this.settings.title))
                    this.queue.add(plotProcess.getBase())
                    this.queue.add(...plotProcess.getData())

                    break

                case ChartType.Pie:
                    let pieProcess = new PieProcess(item as PieData, this.charPrecision)

                    this.queue.add(...pieProcess.getData())

                    break

                case ChartType.TreeMap:
                    let treeProcess = new TreeProcess(item as TreeData)

                    this.queue.add(...treeProcess.getData())

                    break

                case ChartType.Gauge:
                    let gaugeProcess = new GaugeProcess(item as GaugeData)

                    this.queue.add(...gaugeProcess.getData())

                    break
            }
        }
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseDown(event: MouseEvent) {
        this.moveStartPosition = { x: event.offsetX, y: event.offsetY }
        this.moveStartWindow = { x: this.window.x, y: this.window.y }
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseMove(event: MouseEvent) {
        if (this.moveStartPosition == null || this.moveStartWindow == null)
            return

        this.window.moveTo(
            this.moveStartWindow.x + event.offsetX - this.moveStartPosition.x,
            this.moveStartWindow.y + event.offsetY - this.moveStartPosition.y
        )
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseUp() {
        this.moveStartPosition = null
        this.moveStartWindow = null
    }

    /**
     * Uses for zoom canvas using middle mouse button
     */
    // todo: meh name
    private onWheel(event: WheelEvent) {
        event.preventDefault()

        const xRatio = event.offsetX / this.canvas.width - .5
        const yRatio = event.offsetY / this.canvas.height - .5

        if (event.deltaY > 0) {
            this.window.in(ZOOM_DEFAULT_STEP, xRatio, yRatio)
        }

        if (event.deltaY < 0) {
            this.window.out(-ZOOM_DEFAULT_STEP, xRatio, yRatio)
        }
    }

    private getMousePoint(event: MouseEvent): Point {
        const onCanvas = {
            x: event.offsetX - this.window.x,
            y: event.offsetY - this.window.y
        }

        return {
            x: RenderItem.adjustX(this.window, onCanvas.x / this.window.width * COORDS_MAX_X),
            y: RenderItem.adjustY(this.window, onCanvas.y / this.window.height * COORDS_MAX_Y)
        }
    }

    /**
     * Uses for intercept mouse moving on canvas
     */
    // todo: meh name
    private onMouseMove2(event: MouseEvent) {
        this.currentMousePoint = this.getMousePoint(event)
    }

    /**
     * Uses for intercept opening context menu
     */
    // todo: meh name
    private onContextMenu(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        this.isOpenContext = true
        this.contextMenuPoint = this.getMousePoint(event)
    }

    /**
     * Uses for intercept closing context menu when click outside
     */
    private onContextMenuClick(event: MouseEvent) {
        this.isOpenContext = false
        this.contextMenuPoint = null
    }

    /**
     * Uses for process mouse click on rendered item
     */
    private onMouseClick(event: MouseEvent) {
        const items = this.isOpenContext
                      ? this.queue.queue.filter(item => item.isContextMenu)
                      : this.queue.queue

        for (const item of items) {
            if (item.in(this.getMousePoint(event))) {
                item.color = 'green'
                item.activeColor = 'green'

                if (item.onClick) {
                    item.onClick()
                }
            }
        }
    }

    private DEBUGonMouseMove(event: MouseEvent) {
        if (!Debug.isEnabled) {
            return
        }

        for (const item of this.queue.queue.filter(item => !item.isDebug)) {
            const pos = this.getMousePoint(event)

            if (item.in(pos)) {
                this.queue.add((items: QueueItemsBuilder) => {
                    items.rect()
                         .position(pos.x, pos.y)
                         .size(200, 200)
                         .fill()
                         .color('#ff000077')
                         .temp()
                         .debug()
                })
            }
        }
    }

    /**
     * Recalculate DOM size
     */
    calculateWindow() {
        this.window = new CanvasWindow(this.canvas)
    }
}