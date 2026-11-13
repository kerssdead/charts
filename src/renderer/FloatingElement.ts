import Point from '@/types/Point'
import { placeNear } from '@/helpers/Geometry'
import { Events } from '@/static/Enums'

const VIEWPORT_PADDING = 8

export default class FloatingElement {
    readonly element = document.createElement('div')

    private readonly canvas: HTMLCanvasElement

    private readonly offset: number

    minWidth = 0

    private point: Point = { x: 0, y: 0 }

    private observer: ResizeObserver | null = null

    private abort: AbortController | null = null

    constructor(canvas: HTMLCanvasElement, offset: number) {
        this.canvas = canvas
        this.offset = offset

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

    remove() {
        this.abort?.abort()
        this.abort = null
        this.observer?.disconnect()
        this.observer = null
        this.element.remove()
    }

    private watchSize() {
        this.abort = new AbortController()

        const options = { signal: this.abort.signal }
        const place = () => this.place()

        window.addEventListener(Events.Resize, place, options)
        window.addEventListener(Events.Scroll, place, { ...options, capture: true })
        window.visualViewport?.addEventListener(Events.Resize, place, options)
        window.visualViewport?.addEventListener(Events.Scroll, place, options)

        this.observer = new ResizeObserver(place)
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

    private place() {
        const canvas = this.canvas.getBoundingClientRect()
        const bounds = this.getViewport()
        const { element } = this

        element.style.minWidth = `${ Math.min(this.minWidth, bounds.width) }px`
        element.style.maxWidth = `${ bounds.width }px`
        element.style.maxHeight = `${ bounds.height }px`

        const point = {
            x: canvas.left + this.point.x * canvas.width / (this.canvas.clientWidth || canvas.width || 1),
            y: canvas.top + this.point.y * canvas.height / (this.canvas.clientHeight || canvas.height || 1)
        }
        const position = placeNear(point, element.getBoundingClientRect(), this.offset, bounds)

        element.style.left = `${ Math.min(position.x, bounds.x + bounds.width - element.offsetWidth) }px`
        element.style.top = `${ Math.min(position.y, bounds.y + bounds.height - element.offsetHeight) }px`
    }
}