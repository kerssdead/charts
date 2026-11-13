import { createCanvas } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Theme, { ColorTheme } from '@/Theme'
import { Events } from '@/static/Enums'
import Renderer from '@/renderer/Renderer'
import Debug from '@/helpers/Debug'
import { keepState, normalize } from '@/helpers/Settings'
import ChartFailure from '@/ui/ChartFailure'
import { applyFallbackHostSize, applyHostSize, getPixelSize } from '@/helpers/HostSize'

// todo: add public api

export default class Chart {
    private isDestroyed: boolean = false

    private isSuspended: boolean = false

    private suspendedTheme: ColorTheme = ColorTheme.light

    private source: ChartSettings

    private settings: ChartSettings

    private readonly element: HTMLElement

    private readonly failure: ChartFailure

    private canvas: HTMLCanvasElement

    private renderer: Renderer

    private observer: ResizeObserver

    private ratioWatcher: AbortController

    private width: number = 0

    private height: number = 0

    private readonly onThemeChange = () => {
        this.applySettings(this.source)
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        this.element = element
        this.failure = new ChartFailure(element)

        this.start(settings)
    }

    render() {
        if (this.isDestroyed || this.failure.isActive)
            return

        this.renderer.render()
    }

    destroy() {
        this.failure.clear()

        if (this.isDestroyed)
            return

        this.isDestroyed = true

        this.stop()
    }

    private start(settings: ChartSettings) {
        const element = this.element

        this.source = settings

        try {
            this.settings = normalize(settings, element)

            this.bindMenuActions()
            applyHostSize(element, this.settings)
            applyFallbackHostSize(element, this.settings)

            this.canvas = createCanvas()
            element.appendChild(this.canvas)

            Theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)

            this.renderer = new Renderer(this.canvas, error => this.handleError(error))
            this.renderer.apply(this.settings)

            Debug.log(settings, this.settings, this.canvas)

            this.observer = this.createObserver(element)
            this.ratioWatcher = new AbortController()
            this.watchRatio()

            if (!this.canvas.isConnected)
                this.suspend()
        } catch (error) {
            this.handleError(error)
        }
    }

    private stop() {
        this.observer?.disconnect()
        this.ratioWatcher?.abort()

        Theme.detach(this.onThemeChange)
        this.canvas?.remove()

        this.renderer?.destroy()
    }

    private guard(action: () => void) {
        if (this.isDestroyed || this.failure.isActive)
            return

        try {
            action()
        } catch (error) {
            this.handleError(error)
        }
    }

    private handleError(error: unknown) {
        if (this.isDestroyed || this.failure.isActive)
            return

        try {
            this.stop()
        } catch (stopError) {
            console.error(stopError)
        }

        this.failure.report(error, {
            element: this.element,
            size: { width: this.width, height: this.height },
            theme: ColorTheme[Theme.currentTheme],
            input: this.source,
            settings: this.settings
        }, this.source.onError)
    }

    private recover(settings: ChartSettings) {
        this.failure.clear()

        this.isSuspended = false
        this.width = 0
        this.height = 0

        this.start(settings)
    }

    applySettings(settings: ChartSettings) {
        if (this.isDestroyed)
            return

        if (this.failure.isActive)
            this.recover(settings)
        else
            this.guard(() => this.update(settings))
    }

    private update(settings: ChartSettings) {
        const previous = this.settings

        this.source = settings
        this.settings = normalize(settings, this.element)

        keepState(previous, this.settings)

        this.bindMenuActions()
        applyHostSize(this.element, this.settings)

        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.canvas)
    }

    private bindMenuActions() {
        for (const item of this.settings.contextMenu ?? []) {
            const id = item.id

            if (id === undefined)
                continue

            item.action ??= data => {
                this.element.dispatchEvent(new CustomEvent(id, { detail: data }))
            }
        }
    }

    private resize(width: number, height: number, device?: ResizeObserverSize) {
        this.guard(() => this.resizeCanvas(width, height, device))
    }

    private resizeCanvas(
        width: number,
        height: number,
        device?: ResizeObserverSize
    ) {
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

        this.renderer.resize(width, height, pixelWidth / width)
        this.renderer.render()
    }

    private watchRatio() {
        matchMedia(`(resolution: ${ window.devicePixelRatio }dppx)`).addEventListener(Events.Change, () => {
            this.resize(this.width, this.height)
            this.watchRatio()
        }, { once: true, signal: this.ratioWatcher.signal })
    }

    private createObserver(node: HTMLElement) {
        const observer = new ResizeObserver(entries => {
            if (!this.canvas.isConnected) {
                this.suspend()

                return
            }

            this.resume()

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

    private suspend() {
        if (this.isSuspended || this.isDestroyed)
            return

        this.isSuspended = true

        Theme.update(this.settings.isDarkThemeFunction)
        this.suspendedTheme = Theme.currentTheme

        Theme.detach(this.onThemeChange)
        this.renderer.suspend()
    }

    private resume() {
        if (!this.isSuspended || this.isDestroyed)
            return

        this.isSuspended = false

        Theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)
        this.renderer.resume()

        if (Theme.currentTheme !== this.suspendedTheme)
            this.onThemeChange()
    }
}