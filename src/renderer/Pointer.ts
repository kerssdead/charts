import Point from 'types/Point'
import { Events } from 'static/Enums'
import { COORDS_MAX_X, COORDS_MAX_Y, ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import CanvasWindow from 'types/CanvasWindow'
import RenderItem from 'types/RenderItem'

type PointerHandlers = {
    onClick: (point: Point) => void
    onMove: (point: Point) => void
    onChange: () => void
}

export default class Pointer {
    position: Point | null = null

    contextPoint: Point | null = null

    isContextOpen: boolean = false

    private moveStartPosition: Point | null = null

    private moveStartWindow: Point | null = null

    private abort: AbortController = new AbortController()

    private isMoveEnabled: boolean | null = null

    private readonly canvas: HTMLCanvasElement

    private readonly getWindow: () => CanvasWindow

    private readonly handlers: PointerHandlers

    constructor(canvas: HTMLCanvasElement,
                getWindow: () => CanvasWindow,
                handlers: PointerHandlers) {
        this.canvas = canvas
        this.getWindow = getWindow
        this.handlers = handlers
    }

    attach(enableMove: boolean) {
        if (enableMove === this.isMoveEnabled)
            return

        this.detach()

        this.isMoveEnabled = enableMove

        if (enableMove) {
            this.listen(this.canvas, Events.MouseDown, (event: MouseEvent) => {
                this.onDragStart(event)
            })
            this.listen(document, Events.MouseMove, (event: MouseEvent) => {
                this.onDrag(event)
            })
            this.listen(document, Events.MouseUp, () => {
                this.onDragEnd()
            })
            this.listen(this.canvas, Events.Wheel, (event: WheelEvent) => {
                this.onWheel(event)
            })
        }

        this.listen(this.canvas, Events.MouseMove, (event: MouseEvent) => {
            this.position = this.toPoint(event)
            this.handlers.onMove(this.position)
        })
        this.listen(this.canvas, Events.ContextMenu, (event: MouseEvent) => {
            this.onContextMenu(event)
        })
        this.listen(this.canvas, Events.Click, (event: MouseEvent) => {
            this.handlers.onClick(this.toPoint(event))
        })
        this.listen(document, Events.Click, () => {
            this.closeContext()
        })
        this.listen(this.canvas, Events.MouseLeave, () => {
            this.release()
        })
        this.listen(window, Events.Blur, () => {
            this.release()
        })
    }

    detach() {
        this.abort.abort()
        this.abort = new AbortController()

        this.isMoveEnabled = null
    }

    reset() {
        this.release()
        this.closeContext()
    }

    closeContext() {
        if (!this.isContextOpen)
            return

        this.isContextOpen = false
        this.contextPoint = null

        this.handlers.onChange()
    }

    private listen(target: EventTarget, type: string, listener: (event: any) => void) {
        target.addEventListener(type, listener, { signal: this.abort.signal })
    }

    private release() {
        this.position = null
        this.moveStartPosition = null
        this.moveStartWindow = null

        this.handlers.onChange()
    }

    private toPoint(event: MouseEvent): Point {
        const window = this.getWindow()

        const onCanvas = {
            x: event.offsetX - window.x,
            y: event.offsetY - window.y
        }

        return {
            x: RenderItem.adjustX(window, onCanvas.x / window.width * COORDS_MAX_X),
            y: RenderItem.adjustY(window, onCanvas.y / window.height * COORDS_MAX_Y)
        }
    }

    private onDragStart(event: MouseEvent) {
        const window = this.getWindow()

        this.moveStartPosition = { x: event.offsetX, y: event.offsetY }
        this.moveStartWindow = { x: window.x, y: window.y }
    }

    private onDrag(event: MouseEvent) {
        if (this.moveStartPosition == null || this.moveStartWindow == null)
            return

        this.getWindow().moveTo(
            this.moveStartWindow.x + event.offsetX - this.moveStartPosition.x,
            this.moveStartWindow.y + event.offsetY - this.moveStartPosition.y
        )

        this.handlers.onChange()
    }

    private onDragEnd() {
        this.moveStartPosition = null
        this.moveStartWindow = null
    }

    private onWheel(event: WheelEvent) {
        event.preventDefault()

        const window = this.getWindow()

        const xRatio = event.offsetX / this.canvas.width - .5
        const yRatio = event.offsetY / this.canvas.height - .5

        if (event.deltaY > 0)
            window.in(ZOOM_DEFAULT_STEP, xRatio, yRatio)

        if (event.deltaY < 0)
            window.out(-ZOOM_DEFAULT_STEP, xRatio, yRatio)

        this.handlers.onChange()
    }

    private onContextMenu(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        this.isContextOpen = true
        this.contextPoint = this.toPoint(event)

        this.handlers.onChange()
    }
}