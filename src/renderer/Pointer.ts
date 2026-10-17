import Point from 'types/Point'
import { Events } from 'static/Enums'
import { ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import Styles from 'static/constants/Styles'
import CanvasWindow from 'types/CanvasWindow'

type PointerHandlers = {
    onClick: (point: Point) => void
    onChange: () => void
    canDrag: (point: Point) => boolean
}

type DragState = {
    pointerId: number
    x: number
    y: number
    windowX: number
    windowY: number
}

const DRAG_THRESHOLD = 3

const WHEEL_NOTCH = 100

const WHEEL_LINE_HEIGHT = 16

export default class Pointer {
    position: Point | null = null

    contextPoint: Point | null = null

    isContextOpen: boolean = false

    isMenu: boolean = false

    private drag: DragState | null = null

    private isDragged: boolean = false

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
            this.canvas.style.touchAction = Styles.TouchAction.None

            this.listen(this.canvas, Events.PointerDown, event => this.onDragStart(event))
            this.listen(this.canvas, Events.LostPointerCapture, () => this.drag = null)
            this.listen(this.canvas, Events.Wheel, event => this.onWheel(event))
        }

        this.listen(this.canvas, Events.PointerMove, event => this.onMove(event))
        this.listen(this.canvas, Events.PointerLeave, () => this.setPosition(null))
        this.listen(this.canvas, Events.ContextMenu, event => this.onContextMenu(event))
        this.listen(this.canvas, Events.Click, event => {
            const isOpen = this.isContextOpen

            if (!this.isDragged)
                this.handlers.onClick(this.toPoint(event))

            if (isOpen)
                this.closeContext()
        })
        this.listen(document, Events.Click, event => {
            if (event.target !== this.canvas)
                this.closeContext()
        })
        this.listen(window, Events.Blur, () => this.setPosition(null))
    }

    detach() {
        this.abort.abort()
        this.abort = new AbortController()

        this.canvas.style.touchAction = ''

        this.position = null
        this.contextPoint = null
        this.isContextOpen = false
        this.isMenu = false
        this.drag = null
        this.isDragged = false
        this.isMoveEnabled = null
    }

    openMenu(point: Point) {
        this.isContextOpen = true
        this.isMenu = true
        this.contextPoint = point

        this.handlers.onChange()
    }

    closeContext() {
        if (!this.isContextOpen)
            return

        this.isContextOpen = false
        this.isMenu = false
        this.contextPoint = null

        this.handlers.onChange()
    }

    private listen<E extends Events>(target: EventTarget,
                                     type: E,
                                     listener: (event: HTMLElementEventMap[`${E}`]) => void) {
        target.addEventListener(type, listener as EventListener, { signal: this.abort.signal })
    }

    private toPoint(event: MouseEvent): Point {
        return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) }
    }

    private onMove(event: PointerEvent) {
        if (!event.isPrimary)
            return

        if (!this.onDrag(event))
            this.setPosition(this.toPoint(event))
    }

    private setPosition(position: Point | null) {
        if (position?.x === this.position?.x && position?.y === this.position?.y)
            return

        this.position = position

        this.handlers.onChange()
    }

    private onDragStart(event: PointerEvent) {
        this.isDragged = false

        if (!event.isPrimary || event.button !== 0 || !this.handlers.canDrag(this.toPoint(event)))
            return

        const view = this.getWindow()

        this.drag = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            windowX: view.x,
            windowY: view.y
        }

        this.canvas.setPointerCapture(event.pointerId)
    }

    private onDrag(event: PointerEvent): boolean {
        if (this.drag?.pointerId !== event.pointerId)
            return false

        const dx = event.clientX - this.drag.x
        const dy = event.clientY - this.drag.y

        if (!this.isDragged && Math.hypot(dx, dy) < DRAG_THRESHOLD)
            return false

        this.isDragged = true

        const { windowX, windowY } = this.drag

        if (this.updateWindow(view => view.moveTo(windowX + dx, windowY + dy))) {
            this.position = null
            this.handlers.onChange()
        } else {
            this.setPosition(null)
        }

        return true
    }

    private onWheel(event: WheelEvent) {
        if (!event.ctrlKey && !event.metaKey)
            return

        event.preventDefault()

        const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_HEIGHT : 1)

        const step = Math.min(Math.max(-delta / WHEEL_NOTCH, -1), 1) * ZOOM_DEFAULT_STEP

        if (this.updateWindow(view => view.zoom(step, this.toPoint(event))))
            this.handlers.onChange()
    }

    private updateWindow(update: (view: CanvasWindow) => void): boolean {
        const view = this.getWindow()
        const { x, y, width, height } = view

        update(view)

        return view.x !== x || view.y !== y || view.width !== width || view.height !== height
    }

    private onContextMenu(event: MouseEvent) {
        event.preventDefault()

        this.isContextOpen = true
        this.isMenu = false
        this.contextPoint = this.toPoint(event)

        this.handlers.onChange()
    }
}