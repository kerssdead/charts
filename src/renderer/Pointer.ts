import Point from '@/types/Point'
import { Events } from '@/static/Enums'
import { ZOOM_DEFAULT_STEP } from '@/static/constants/Index'
import Styles from '@/static/constants/Styles'
import CanvasWindow from '@/types/CanvasWindow'
import PointerContext from '@/types/PointerContext'
import { clamp, copyRect, sameRect, samePoint } from '@/helpers/Geometry'

type PointerHandlers = {
    onClick: (point: Point) => void
    onChange: () => void
    canDrag: (point: Point) => boolean
    hasContextMenuAt: (point: Point) => boolean
    scrollBy: (point: Point, delta: number) => boolean | null
    getScrollDrag: (point: Point) => ScrollDrag | null
}

export type ScrollDrag = (dy: number) => boolean

type DragState = {
    pointerId: number
    x: number
    y: number
    windowX: number
    windowY: number
    scroll: ScrollDrag | null
}

const DRAG_THRESHOLD = 3

const WHEEL_NOTCH = 100

const WHEEL_LINE_HEIGHT = 16

const WHEEL_LATCH = 400

export default class Pointer {
    position: Point | null = null

    context: PointerContext | null = null

    private drag: DragState | null = null

    private isDragged: boolean = false

    private abort: AbortController = new AbortController()

    private dragAbort: AbortController | null = null

    private isMoveEnabled: boolean | null = null

    private isScrollable: boolean = false

    private lastWheel: DOMHighResTimeStamp = -Infinity

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

        this.updateDragging()

        this.listen(this.canvas, Events.PointerMove, event => this.onMove(event))
        this.listen(this.canvas, Events.PointerLeave, () => this.setPosition(null))
        this.listen(this.canvas, Events.ContextMenu, event => this.onContextMenu(event))
        this.listen(this.canvas, Events.Click, event => {
            const isOpen = this.context != null

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

        this.dragAbort?.abort()
        this.dragAbort = null

        this.canvas.style.touchAction = ''

        this.position = null
        this.context = null
        this.drag = null
        this.isDragged = false
        this.isMoveEnabled = null
    }

    setScrollable(value: boolean) {
        this.isScrollable = value

        this.updateDragging()
    }

    private updateDragging() {
        const isEnabled = this.isMoveEnabled != null && (this.isMoveEnabled || this.isScrollable)

        this.canvas.style.touchAction = isEnabled ? Styles.TouchAction.None : ''

        if (isEnabled == (this.dragAbort != null))
            return

        this.dragAbort?.abort()
        this.dragAbort = isEnabled ? new AbortController() : null

        if (!this.dragAbort)
            return

        const { signal } = this.dragAbort

        this.listen(this.canvas, Events.PointerDown, event => this.onDragStart(event), signal)
        this.listen(this.canvas, Events.LostPointerCapture, () => this.drag = null, signal)
        this.listen(this.canvas, Events.Wheel, event => this.onWheel(event), signal)
    }

    openMenu(point: Point) {
        this.context = { point, isMenu: true }

        this.handlers.onChange()
    }

    closeContext() {
        if (!this.context)
            return

        this.context = null

        this.handlers.onChange()
    }

    private listen<E extends Events>(target: EventTarget,
                                     type: E,
                                     listener: (event: HTMLElementEventMap[`${E}`]) => void,
                                     signal: AbortSignal = this.abort.signal) {
        target.addEventListener(type, listener as EventListener, { signal })
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
        if (samePoint(position, this.position))
            return

        this.position = position

        this.handlers.onChange()
    }

    private onDragStart(event: PointerEvent) {
        this.isDragged = false

        if (!event.isPrimary || event.button !== 0)
            return

        const point = this.toPoint(event)
        const scroll = this.handlers.getScrollDrag(point)

        if (!scroll && !(this.isMoveEnabled && this.handlers.canDrag(point)))
            return

        const view = this.getWindow()

        this.drag = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            windowX: view.x,
            windowY: view.y,
            scroll
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

        const { windowX, windowY, scroll } = this.drag

        const isChanged = scroll
                          ? scroll(dy)
                          : this.updateWindow(view => view.moveTo(windowX + dx, windowY + dy))

        if (isChanged) {
            this.position = null
            this.handlers.onChange()
        } else if (!scroll) {
            this.setPosition(null)
        }

        return true
    }

    private onWheel(event: WheelEvent) {
        const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_HEIGHT : 1)

        if (!event.ctrlKey && !event.metaKey) {
            if (delta != 0)
                this.onWheelScroll(event, delta)

            return
        }

        if (!this.isMoveEnabled)
            return

        event.preventDefault()

        const step = clamp(-delta / WHEEL_NOTCH, -1, 1) * ZOOM_DEFAULT_STEP

        if (this.updateWindow(view => view.zoom(step, this.toPoint(event))))
            this.handlers.onChange()
    }

    private onWheelScroll(event: WheelEvent, delta: number) {
        const isScrolled = this.handlers.scrollBy(this.toPoint(event), delta)
        const isLatched = event.timeStamp - this.lastWheel <= WHEEL_LATCH

        if (isScrolled == null || !isScrolled && !isLatched)
            return

        event.preventDefault()

        this.lastWheel = event.timeStamp

        if (isScrolled)
            this.handlers.onChange()
    }

    private updateWindow(update: (view: CanvasWindow) => void): boolean {
        const view = this.getWindow()
        const previous = copyRect(view)

        update(view)

        return !sameRect(view, previous)
    }

    private onContextMenu(event: MouseEvent) {
        const point = this.toPoint(event)

        if (!this.handlers.hasContextMenuAt(point))
            return

        event.preventDefault()

        this.context = { point, isMenu: false }

        this.handlers.onChange()
    }
}