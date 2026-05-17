import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import RenderStep from 'types/RenderStep'
import Box from 'types/Box'
import Point from 'types/Point'
import { Events } from 'static/Enums'
import Debug from '../Debug'

/* Renderer size:
 * [   0, ..., 5000]
 * [ ..., ...,  ...]
 * [5000, ..., 5000]
 */

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    private queue: Queue

    private readonly canvas: HTMLCanvasElement

    private readonly maxSize: Box

    // private get window(): Point { return DefaultRenderer.canvasWindow.get('key') ?? { x:0,y:0 } }

    constructor(canvas: HTMLCanvasElement) {
        Debug.initialize(true)

        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))
        this.maxSize = new Box(5000, 5000)
        // this.window = {
        //     x: 0,
        //     y: 0
        // }

        DefaultRenderer.canvasWindow ??= new Map<string, Point>()
        DefaultRenderer.canvasZoom ??= new Map<string, number>()

        DefaultRenderer.canvasWindow.set('key', { x: 0, y: 0 })
        DefaultRenderer.canvasZoom.set('key', 1)

        // this.canvas.onmousedown = this.moveMouseDownHandler
        // this.canvas.onmousemove = this.moveMouseMoveHandler
        // document.onmouseup += this.moveMouseUpHandler

        this.canvas.addEventListener(Events.MouseDown, ev => this.moveMouseDownHandler(ev, 'key'))
        document.addEventListener(Events.MouseMove, ev => this.moveMouseMoveHandler(ev, 'key'))
        document.addEventListener(Events.MouseUp, this.moveMouseUpHandler)

        this.canvas.addEventListener('wheel',ev => this.zoomScrollHandler(ev, 'key'))
    }

    render(): void {
        this.queue.queue = this.adjustPosition(this.getSteps())
        this.queue.render()

        requestAnimationFrame(this.render.bind(this))
    }

    private getSteps(): RenderStep[] {
        return [
            RenderStep.Move(1000, 1000),
            RenderStep.Line(2000, 4000),
            RenderStep.Move(500, 4500),
            RenderStep.Line(4500, 500)
        ]
    }

    private adjustPosition(steps: RenderStep[]): RenderStep[] {
        const box = this.canvas.getBoundingClientRect()

        const window = DefaultRenderer.canvasWindow.get('key') ?? { x: 0, y: 0 }
        const zoom = DefaultRenderer.canvasZoom.get('key') ?? 1

        return steps.map(step => {
            step.position.x = Math.round((Math.round(step.position.x / this.maxSize.width * box.width) - window.x) * zoom)
            step.position.y = Math.round((Math.round(step.position.y / this.maxSize.height * box.height) - window.y) * zoom)

            return step
        })
    }

    static moveStartPosition: Point | null

    static moveStartWindow: Point | null

    private moveMouseDownHandler(event: MouseEvent, key: string) {
        DefaultRenderer.moveStartPosition = { x: event.offsetX, y: event.offsetY }
        DefaultRenderer.moveStartWindow = DefaultRenderer.canvasWindow.get(key) ?? { x: 0, y: 0 }
    }

    private moveMouseMoveHandler(event: MouseEvent, key: string) {
        if (DefaultRenderer.moveStartPosition == null || DefaultRenderer.moveStartWindow == null)
            return

        DefaultRenderer.canvasWindow.set(
            key,
            {
                x: DefaultRenderer.moveStartWindow.x + DefaultRenderer.moveStartPosition.x - event.offsetX,
                y: DefaultRenderer.moveStartWindow.y + DefaultRenderer.moveStartPosition.y - event.offsetY
            })
    }

    private moveMouseUpHandler() {
        DefaultRenderer.moveStartPosition = null
        DefaultRenderer.moveStartWindow = null
    }

    static canvasWindow: Map<string, Point>

    private zoomScrollHandler(event: WheelEvent, key: string) {
        event.preventDefault()

        const currentValue = DefaultRenderer.canvasZoom.get(key) ?? 1
        const window = DefaultRenderer.canvasWindow.get(key) ?? { x: 0, y: 0 }

        const factor = .05

        let x = event.offsetX / this.canvas.width - .5 // this.canvas.width / 2
        let y = event.offsetY / this.canvas.height - .5 // this.canvas.height / 2

        let xValue = this.canvas.width * x
        let yValue = this.canvas.height * y

        let direction = 1

        // in
        if (event.deltaY > 0) {
            if (currentValue > .2)
                DefaultRenderer.canvasZoom.set(key, currentValue - factor)

            direction = -2
        }

        // out
        if (event.deltaY < 0) {
            if (currentValue < 1.8)
                DefaultRenderer.canvasZoom.set(key, currentValue + factor)

            direction = 1
        }

        DefaultRenderer.canvasWindow.set(
            key,
            {
                x: window.x + Math.round(xValue * factor) * direction,
                y: window.y + Math.round(yValue * factor) * direction
            }
        )
    }

    static canvasZoom: Map<string, number>
}