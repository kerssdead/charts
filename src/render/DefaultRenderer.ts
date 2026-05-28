import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import Point from 'types/Point'
import { Events } from 'static/Enums'
import Debug from '../Debug'
import CanvasWindow from '../types/CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y, ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import RenderItem from '../types/RenderItem'

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    private queue: Queue

    private window: CanvasWindow

    private moveStartPosition: Point | null

    private moveStartWindow: Point | null

    private readonly canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement) {
        Debug.initialize(true)

        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))

        this.window = new CanvasWindow(canvas)

        this.queue.add(items => {
            items.line()
                 .stop(500, 500)
                 .stop(4500, 4500)
                 .width(10)
                 .color('green')

            items.rect()
                .position(100,100)
                .size(200, 200)
                .fill()
        })

        this.canvas.addEventListener(Events.MouseDown, ev => this.onMouseDown(ev))
        document.addEventListener(Events.MouseMove, ev => this.onMouseMove(ev))
        document.addEventListener(Events.MouseUp, _ => this.onMouseUp())

        this.canvas.addEventListener(Events.Wheel, ev => this.onWheel(ev))
    }

    render(): void {
        this.queue.queue = this.adjustPosition(this.queue.queue)
        this.queue.render()

        requestAnimationFrame(this.render.bind(this))
    }

    private adjustPosition(steps: RenderItem[]): RenderItem[] {
        return steps.map(step => {
            step.adjust(
                (x: number) => Math.round(x / COORDS_MAX_X * this.window.width + this.window.x),
                (y: number) => Math.round(y / COORDS_MAX_Y * this.window.height + this.window.y)
            )

            return step
        })
    }

    private onMouseDown(event: MouseEvent) {
        this.moveStartPosition = { x: event.offsetX, y: event.offsetY }
        this.moveStartWindow = { x: this.window.x, y: this.window.y }
    }

    private onMouseMove(event: MouseEvent) {
        if (this.moveStartPosition == null || this.moveStartWindow == null)
            return

        this.window.moveTo(
            this.moveStartWindow.x + event.offsetX - this.moveStartPosition.x,
            this.moveStartWindow.y + event.offsetY - this.moveStartPosition.y
        )
    }

    private onMouseUp() {
        this.moveStartPosition = null
        this.moveStartWindow = null
    }

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
}