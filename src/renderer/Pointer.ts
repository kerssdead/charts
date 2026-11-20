import Point from '@/types/Point'
import { Events } from '@/static/Enums'
import Styles from '@/static/constants/Styles'
import CanvasWindow from '@/types/CanvasWindow'
import PointerContext from '@/types/PointerContext'
import ScrollDrag from '@/types/ScrollDrag'
import PointHelper from '@/helpers/PointHelper'
import Rectangle from '@/helpers/Rectangle'
import PointerWheel from '@/renderer/PointerWheel'

type PointerHandlers = {
    onClick: (point: Point) => void
    onChange: () => void
    onKeyDown: (event: KeyboardEvent) => boolean
    onPointerMove: () => void
    onBlur: () => void
    canDrag: (point: Point) => boolean
    hasContextMenuAt: (point: Point) => boolean
    scrollBy: (point: Point, delta: number) => boolean | null
    getScrollDrag: (point: Point) => ScrollDrag | null
}

type DragState = {
    pointerId: number
    x: number
    y: number
    windowX: number
    windowY: number
    scroll: ScrollDrag | null
}

const DRAG_THRESHOLD = 3

export default class Pointer {
    position: Point | null = null

    context: PointerContext | null = null

    private drag: DragState | null = null

    private isDragged: boolean = false

    private abort: AbortController = new AbortController()

    private dragAbort: AbortController | null = null

    private isAttached: boolean = false

    private isMoveEnabled: boolean = false

    private isScrollable: boolean = false

    private readonly canvas: HTMLCanvasElement

    private readonly getWindow: () => CanvasWindow

    private readonly handlers: PointerHandlers

    private readonly wheel: PointerWheel

    constructor(canvas: HTMLCanvasElement, getWindow: () => CanvasWindow, handlers: PointerHandlers) {
        this.canvas = canvas
        this.getWindow = getWindow
        this.handlers = handlers
        this.wheel = new PointerWheel({
            isZoomEnabled: () => this.isMoveEnabled,
            zoom: (step, point) => this.updateWindow(view => view.zoom(step, point)),
            scrollBy: (point, delta) => handlers.scrollBy(point, delta),
            onChange: () => handlers.onChange()
        })
    }

    attach(enableMove: boolean) {
        if (this.isAttached && !!enableMove === this.isMoveEnabled)
            return

        this.detach()

        this.isAttached = true
        this.isMoveEnabled = !!enableMove

        this.updateDragging()

        this.listen(this.canvas, Events.PointerMove, event => this.onMove(event))
        this.listen(this.canvas, Events.PointerLeave, () => this.setPosition(null))
        this.listen(this.canvas, Events.ContextMenu, event => this.onContextMenu(event))
        this.listen(this.canvas, Events.Click, event => this.onClick(event))
        this.listen(this.canvas, Events.KeyDown, event => this.onKeyDown(event))
        this.listen(this.canvas, Events.FocusOut, () => this.handlers.onBlur())
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
        this.isAttached = false
        this.isMoveEnabled = false
    }

    setScrollable(value: boolean) {
        this.isScrollable = value

        this.updateDragging()
    }

    private updateDragging() {
        const isEnabled = this.isAttached && (this.isMoveEnabled || this.isScrollable)

        this.canvas.style.touchAction = isEnabled ? Styles.TouchAction.None : ''

        if (isEnabled === (this.dragAbort != null))
            return

        this.dragAbort?.abort()
        this.dragAbort = isEnabled ? new AbortController() : null

        if (!this.dragAbort)
            return

        const { signal } = this.dragAbort

        this.listen(this.canvas, Events.PointerDown, event => this.onDragStart(event), signal)
        this.listen(this.canvas, Events.LostPointerCapture, () => this.drag = null, signal)
        this.listen(this.canvas, Events.Wheel, event => this.wheel.handle(event, this.toPoint(event)), signal)
    }

    openMenu(point: Point) {
        this.context = { point, isOpenedFromButton: true }

        this.handlers.onChange()
    }

    closeContext() {
        if (!this.context)
            return

        this.context = null

        this.handlers.onChange()
    }

    private listen<E extends Events>(
        target: EventTarget,
        type: E,
        listener: (event: HTMLElementEventMap[`${E}`]) => void,
        signal: AbortSignal = this.abort.signal
    ) {
        target.addEventListener(type, listener as EventListener, { signal })
    }

    private toPoint(event: MouseEvent): Point {
        return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (this.handlers.onKeyDown(event))
            event.preventDefault()
    }

    private onClick(event: MouseEvent) {
        const isOpen = this.context != null

        if (!this.isDragged)
            this.handlers.onClick(this.toPoint(event))

        if (isOpen)
            this.closeContext()
    }

    private onMove(event: PointerEvent) {
        if (!event.isPrimary)
            return

        this.handlers.onPointerMove()

        if (!this.onDrag(event))
            this.setPosition(this.toPoint(event))
    }

    private setPosition(position: Point | null) {
        if (PointHelper.same(position, this.position))
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

        if (scroll)
            this.dragScroll(scroll, dy)
        else
            this.dragWindow(windowX + dx, windowY + dy)

        return true
    }

    private dragScroll(scroll: ScrollDrag, dy: number) {
        if (scroll(dy))
            this.clearPosition()
    }

    private dragWindow(x: number, y: number) {
        if (this.updateWindow(view => view.moveTo(x, y)))
            this.clearPosition()
        else
            this.setPosition(null)
    }

    private clearPosition() {
        this.position = null

        this.handlers.onChange()
    }

    private updateWindow(update: (view: CanvasWindow) => void): boolean {
        const view = this.getWindow()
        const previous = Rectangle.copy(view)

        update(view)

        return !Rectangle.same(view, previous)
    }

    openContextMenuAt(point: Point) {
        if (!this.handlers.hasContextMenuAt(point))
            return false

        this.context = { point, isOpenedFromButton: false }

        this.handlers.onChange()

        return true
    }

    private onContextMenu(event: MouseEvent) {
        if (this.openContextMenuAt(this.toPoint(event)))
            event.preventDefault()
    }
}