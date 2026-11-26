import { createCanvas } from '@/helpers/Canvas'
import { getPixelSize } from '@/helpers/HostSize'
import { ChartClasses, Events, PrintEvents } from '@/static/Enums'
import Size from '@/types/Size'

type CanvasHostEvents = {
    onResize: (width: number, height: number, ratio: number) => void
    onDetach: () => void
    onAttach: () => void
}

const VISIBILITY_MARGIN = '0px'

const MAX_PIXEL_RATIO = 2

const RELEASED_SIZE: Size = { width: 0, height: 0 }

export default class CanvasHost {
    readonly canvas: HTMLCanvasElement = createCanvas()

    private readonly observer: ResizeObserver

    private readonly visibility: IntersectionObserver | null

    private readonly printWatcher = new AbortController()

    private ratioWatcher: AbortController | null = null

    private width = 0

    private height = 0

    private pixelSize: Size = RELEASED_SIZE

    private isInViewport = true

    private isPrinting = false

    get size(): Size {
        return { width: this.width, height: this.height }
    }

    get isAttached() {
        return this.canvas.isConnected
    }

    private get isVisible() {
        return this.isInViewport || this.isPrinting
    }

    constructor(element: HTMLElement, private readonly events: CanvasHostEvents) {
        this.canvas.classList.add(ChartClasses.Canvas)
        element.appendChild(this.canvas)

        this.observer = this.createObserver(element)
        this.visibility = this.createVisibilityObserver(element)
        this.watchRatio()
    }

    destroy() {
        this.observer.disconnect()
        this.visibility?.disconnect()
        this.printWatcher.abort()
        this.stopWatchingRatio()

        this.canvas.remove()
    }

    private resize(width: number, height: number, device?: ResizeObserverSize) {
        width = Math.floor(width)
        height = Math.floor(height)

        if (width === 0 || height === 0)
            return

        const pixelSize = getPixelSize(
            { width, height },
            Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
            device
        )

        if (this.width === width && this.height === height
            && this.pixelSize.width === pixelSize.width && this.pixelSize.height === pixelSize.height)
            return

        this.width = width
        this.height = height
        this.pixelSize = pixelSize

        this.applyPixelSize()
        this.canvas.style.width = `${ width }px`
        this.canvas.style.height = `${ height }px`

        this.events.onResize(width, height, pixelSize.width / width)
    }

    private applyPixelSize() {
        const { width, height } = this.isVisible ? this.pixelSize : RELEASED_SIZE

        if (this.canvas.width !== width)
            this.canvas.width = width

        if (this.canvas.height !== height)
            this.canvas.height = height
    }

    private updateVisibility(isInViewport: boolean, isPrinting: boolean) {
        const wasVisible = this.isVisible

        this.isInViewport = isInViewport
        this.isPrinting = isPrinting

        if (this.isVisible === wasVisible)
            return

        this.applyPixelSize()

        if (!this.isAttached)
            return

        if (!this.isVisible)
            return this.events.onDetach()

        this.events.onAttach()

        if (this.width > 0 && this.height > 0)
            this.events.onResize(this.width, this.height, this.pixelSize.width / this.width)
    }

    private watchRatio() {
        this.stopWatchingRatio()
        this.ratioWatcher = new AbortController()

        matchMedia(`(resolution: ${ window.devicePixelRatio }dppx)`).addEventListener(Events.Change, () => {
            this.resize(this.width, this.height)
            this.watchRatio()
        }, { once: true, signal: this.ratioWatcher.signal })
    }

    private stopWatchingRatio() {
        this.ratioWatcher?.abort()
        this.ratioWatcher = null
    }

    private createObserver(node: HTMLElement) {
        const observer = new ResizeObserver(entries => {
            if (!this.isAttached) {
                this.stopWatchingRatio()
                this.events.onDetach()

                return
            }

            if (!this.ratioWatcher)
                this.watchRatio()

            if (this.isVisible)
                this.events.onAttach()

            for (const entry of entries) {
                if (entry.target === this.canvas)
                    this.resize(this.width, this.height, entry.devicePixelContentBoxSize?.[0])
                else
                    this.resize(entry.contentRect.width, entry.contentRect.height)
            }
        })

        observer.observe(node)

        try {
            observer.observe(this.canvas, { box: 'device-pixel-content-box' })
        } catch {
            // Safari has no device-pixel-content-box; the node observer above still tracks resizes
        }

        return observer
    }

    private createVisibilityObserver(node: HTMLElement) {
        if (typeof IntersectionObserver === 'undefined')
            return null

        this.watchPrinting()

        const observer = new IntersectionObserver(entries => {
            const entry = entries[entries.length - 1]

            this.updateVisibility(entry.isIntersecting, this.isPrinting)
        }, { rootMargin: VISIBILITY_MARGIN })

        observer.observe(node)

        return observer
    }

    private watchPrinting() {
        const { signal } = this.printWatcher

        window.addEventListener(PrintEvents.Before, () => {
            this.updateVisibility(this.isInViewport, true)
        }, { signal })
        window.addEventListener(PrintEvents.After, () => {
            this.updateVisibility(this.isInViewport, false)
        }, { signal })
    }
}