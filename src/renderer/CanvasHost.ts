import { createCanvas } from '@/helpers/Canvas'
import { getPixelSize } from '@/helpers/HostSize'
import { ChartClasses, Events } from '@/static/Enums'
import Size from '@/types/Size'

type CanvasHostEvents = {
    onResize: (width: number, height: number, ratio: number) => void
    onDetach: () => void
    onAttach: () => void
}

export default class CanvasHost {
    readonly canvas: HTMLCanvasElement = createCanvas()

    private readonly events: CanvasHostEvents

    private readonly observer: ResizeObserver

    private readonly ratioWatcher = new AbortController()

    private width: number = 0

    private height: number = 0

    get size(): Size {
        return { width: this.width, height: this.height }
    }

    get isAttached() {
        return this.canvas.isConnected
    }

    constructor(element: HTMLElement, events: CanvasHostEvents) {
        this.events = events

        this.canvas.classList.add(ChartClasses.Canvas)
        element.appendChild(this.canvas)

        this.observer = this.createObserver(element)
        this.watchRatio()
    }

    destroy() {
        this.observer.disconnect()
        this.ratioWatcher.abort()

        this.canvas.remove()
    }

    private resize(width: number, height: number, device?: ResizeObserverSize) {
        width = Math.floor(width)
        height = Math.floor(height)

        if (width === 0 || height === 0)
            return

        const { width: pixelWidth, height: pixelHeight } = getPixelSize(
            { width, height },
            window.devicePixelRatio || 1,
            device
        )

        if (this.width === width && this.height === height
            && this.canvas.width === pixelWidth && this.canvas.height === pixelHeight)
            return

        this.width = width
        this.height = height

        this.canvas.width = pixelWidth
        this.canvas.height = pixelHeight
        this.canvas.style.width = `${ width }px`
        this.canvas.style.height = `${ height }px`

        this.events.onResize(width, height, pixelWidth / width)
    }

    private watchRatio() {
        matchMedia(`(resolution: ${ window.devicePixelRatio }dppx)`).addEventListener(Events.Change, () => {
            this.resize(this.width, this.height)
            this.watchRatio()
        }, { once: true, signal: this.ratioWatcher.signal })
    }

    private createObserver(node: HTMLElement) {
        const observer = new ResizeObserver(entries => {
            if (!this.isAttached) {
                this.events.onDetach()

                return
            }

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
}