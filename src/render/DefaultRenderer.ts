import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import Point from 'types/Point'
import { Events, RenderGroupDirection } from 'static/Enums'
import Debug from '../Debug'
import CanvasWindow from '../types/CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y, ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import Margin from '../types/Margin'
import RenderItem from '../types/RenderItem'

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    static timer: DOMHighResTimeStamp = 0

    private queue: Queue

    private window: CanvasWindow

    private moveStartPosition: Point | null

    private moveStartWindow: Point | null

    private currentMousePoint: Point | null

    private readonly canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement) {
        Debug.initialize(true)

        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))

        this.window = new CanvasWindow(canvas)

        this.queue.add(items => {
            // items.line()
            //      .stop(500, 500)
            //      .stop(4500, 4500)
            //      .width(10)
            //      .color('green')
            //
            // items.rect()
            //      .position(100, 100)
            //      .size(200, 200)
            //      .fill()

            items.group()
                 .gap(200)
                 .margin(Margin.all(300))
                 .direction(RenderGroupDirection.Column)
                 .items(groupItems => {
                     groupItems.rect()
                               .fill()
                               .color('#ff000088')

                     groupItems.rect()
                               .fill()
                               .color('#00ff0088')

                     groupItems.rect()
                               .animate()
                               .fill()
                               .color('#0000ff88')
                 })
            // items.group()
            //      .gap(200)
            //      .margin(Margin.all(150))
            //      .direction(RenderGroupDirection.RowReversed)
            //      .items(groupItems => {
            //          groupItems.rect()
            //                    .fill()
            //                    .color('#ff000088')
            //
            //          groupItems.rect()
            //                    .fill()
            //                    .color('#00ff0088')
            //
            //          groupItems.rect()
            //                    .fill()
            //                    .color('#0000ff88')
            //      })

            // items.line()
            //      .stop(0, 0)
            //      .stop(5000, 0)
            //      .color('red')

            // items.arc()
            //      .position(0, 0)
            //      .radius(5000)
            //      .fill()
            //      .color('magenta')
            //     .layer(-1)

            // items.line()
            //      .stop(500, -3000)
            //      .stop(4500, 6000)
            //      .width(10)
            //      .color('orange')
            //      .layer(-1)
        })

        this.canvas.addEventListener(Events.MouseDown, ev => this.onMouseDown(ev))
        document.addEventListener(Events.MouseMove, ev => this.onMouseMove(ev))
        document.addEventListener(Events.MouseUp, _ => this.onMouseUp())

        this.canvas.addEventListener(Events.Wheel, ev => this.onWheel(ev))

        this.canvas.addEventListener(Events.MouseMove, ev => this.onMouseMove2(ev))
    }

    render(): void {
        DefaultRenderer.timer = performance.now()

        this.queue.animate(this.currentMousePoint)

        // todo: exclude render not in CanvasWindow
        this.queue.render(this.window)

        if (this.currentMousePoint) {
            const ctx = Canvas.getContext(this.canvas)

            ctx.beginPath()
            ctx.fillStyle = 'magenta'
            ctx.fillRect(
                this.currentMousePoint.x,
                this.currentMousePoint.y,
                10,
                10
            )
        }

        // todo: if canvas is need to re-render
        requestAnimationFrame(this.render.bind(this))
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
}