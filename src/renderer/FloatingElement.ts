import Point from '@/types/Point'
import Size from '@/types/Size'
import RectangleDimensions from '@/types/RectangleDimensions'
import PointHelper from '@/helpers/PointHelper'
import { Events } from '@/static/Enums'

const VIEWPORT_PADDING = 8

export default class FloatingElement {
    readonly element = document.createElement('div')

    minWidth = 0

    private point: Point = { x: 0, y: 0 }

    private canvasRect: DOMRect | null = null

    private canvasScale: Point | null = null

    private viewport: RectangleDimensions | null = null

    private size: Size | null = null

    private observer: ResizeObserver | null = null

    private abort: AbortController | null = null

    constructor(private readonly canvas: HTMLCanvasElement, private readonly offset: number) {
        Object.assign(this.element.style, {
            position: 'fixed',
            width: 'max-content',
            inset: 'auto',
            margin: '0',
            padding: '0',
            border: '0',
            background: 'transparent',
            overflow: 'auto',
            boxSizing: 'border-box',
            zIndex: '10000'
        })
    }

    show(point: Point) {
        this.point = point

        if (!this.element.isConnected) {
            const host = this.canvas.closest('dialog') ?? document.fullscreenElement ?? document.body

            host.appendChild(this.element)

            // The top layer also escapes transformed and overflow-hidden ancestors.
            if (typeof this.element.showPopover === 'function') {
                this.element.popover = 'manual'
                this.element.showPopover()
            }

            this.watchSize()
        }

        this.place()
    }

    setHtml(html: string) {
        this.element.innerHTML = html
        this.size = null
    }

    remove() {
        this.abort?.abort()
        this.abort = null
        this.observer?.disconnect()
        this.observer = null
        this.element.remove()

        this.invalidate()
    }

    private invalidate() {
        this.canvasRect = null
        this.canvasScale = null
        this.viewport = null
        this.size = null
    }

    private watchSize() {
        this.abort = new AbortController()

        const options = { signal: this.abort.signal }
        const place = () => {
            this.invalidate()
            this.place()
        }

        window.addEventListener(Events.Resize, place, options)
        window.addEventListener(Events.Scroll, place, { ...options, capture: true })
        window.visualViewport?.addEventListener(Events.Resize, place, options)
        window.visualViewport?.addEventListener(Events.Scroll, place, options)

        this.observer = new ResizeObserver(() => {
            this.size = null
            this.place()
        })
        this.observer.observe(this.element)
    }

    private getViewport() {
        const viewport = window.visualViewport

        return {
            x: (viewport?.offsetLeft ?? 0) + VIEWPORT_PADDING,
            y: (viewport?.offsetTop ?? 0) + VIEWPORT_PADDING,
            width: Math.max(0, (viewport?.width ?? document.documentElement.clientWidth) - VIEWPORT_PADDING * 2),
            height: Math.max(0, (viewport?.height ?? document.documentElement.clientHeight) - VIEWPORT_PADDING * 2)
        }
    }

    private getCanvasScale(canvas: RectangleDimensions): Point {
        return this.canvasScale ??= {
            x: canvas.width / (this.canvas.clientWidth || canvas.width || 1),
            y: canvas.height / (this.canvas.clientHeight || canvas.height || 1)
        }
    }

    private place() {
        const canvas = this.canvasRect ??= this.canvas.getBoundingClientRect()
        const bounds = this.viewport ??= this.getViewport()
        const scale = this.getCanvasScale(canvas)
        const { element } = this

        this.applyStyle('minWidth', `${ Math.min(this.minWidth, bounds.width) }px`)
        this.applyStyle('maxWidth', `${ bounds.width }px`)
        this.applyStyle('maxHeight', `${ bounds.height }px`)

        const point = {
            x: canvas.left + this.point.x * scale.x,
            y: canvas.top + this.point.y * scale.y
        }
        const size = this.size ??= { width: element.offsetWidth, height: element.offsetHeight }
        const position = PointHelper.placeNear(point, size, this.offset, bounds)

        this.applyStyle('left', `${ Math.min(position.x, bounds.x + bounds.width - size.width) }px`)
        this.applyStyle('top', `${ Math.min(position.y, bounds.y + bounds.height - size.height) }px`)
    }

    private applyStyle(name: 'minWidth' | 'maxWidth' | 'maxHeight' | 'left' | 'top', value: string) {
        if (this.element.style[name] !== value)
            this.element.style[name] = value
    }
}