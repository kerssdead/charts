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

// todo: add tooltips
// todo: add context menus
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

    private readonly canvas: HTMLCanvasElement

    private readonly settings: ChartSettings

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
    }

    render(): void {
        DefaultRenderer.timer = performance.now()

        this.queue.animate(this.currentMousePoint)

        // todo: exclude render not in CanvasWindow
        this.queue.render(this.window)

        // todo: if canvas is need to re-render
        requestAnimationFrame(this.render.bind(this))
    }

    add(type: ChartType, ...data: Data[]) {
        for (const item of data) {
            switch (type) {
                case ChartType.Plot:
                    let process = new PlotProcess(item as PlotData)

                    this.queue.add(process.getTitles(this.settings.title))
                    this.queue.add(process.getBase())
                    this.queue.add(...process.getData())

                    break;
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

    /**
     * Uses for intercept mouse moving on canvas
     */
    // todo: meh name
    private onMouseMove2(event: MouseEvent) {
        const onCanvas = {
            x: event.offsetX - this.window.x,
            y: event.offsetY - this.window.y
        }

        this.currentMousePoint = {
            x: RenderItem.adjustX(this.window, onCanvas.x / this.window.width * COORDS_MAX_X),
            y: RenderItem.adjustY(this.window, onCanvas.y / this.window.height * COORDS_MAX_Y),
        }
    }

    /**
     * Recalculate DOM size
     */
    calculateWindow() {
        this.window = new CanvasWindow(this.canvas)
    }
}