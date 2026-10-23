import { createCanvas } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Theme, { ColorTheme } from '@/Theme'
import { Events } from '@/static/Enums'
import Renderer from '@/renderer/Renderer'
import { randomColor } from '@/helpers/Color'
import Debug from '@/helpers/Debug'
import { keepDisabled, normalize } from '@/helpers/Settings'
import Styles from '@/static/constants/Styles'

// todo: add public api

export default class Chart {
    private isDestroyed: boolean = false

    private isSuspended: boolean = false

    private suspendedTheme: ColorTheme = ColorTheme.light

    private source: ChartSettings

    private settings: ChartSettings

    private readonly fallbackColor = randomColor()

    private readonly element: HTMLElement

    private readonly canvas: HTMLCanvasElement

    private readonly renderer: Renderer

    private readonly observer: ResizeObserver

    private readonly ratioWatcher = new AbortController()

    private width: number = 0

    private height: number = 0

    private readonly onThemeChange = () => {
        this.applySettings(this.source)
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        this.element = element
        this.source = settings
        this.settings = normalize(settings, this.fallbackColor, this.element)

        this.bindMenuActions()
        this.applySize()

        if (!this.settings.width && element.clientWidth == 0)
            element.style.width = Styles.Size.Full

        if (!this.settings.height && element.clientHeight == 0)
            element.style.height = Styles.Size.Full

        if (!this.settings.height && element.isConnected && element.clientHeight == 0)
            element.style.height = Styles.Size.FallbackHeight

        this.canvas = createCanvas()
        element.appendChild(this.canvas)

        Theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)

        this.renderer = new Renderer(this.canvas)
        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.canvas)

        this.observer = this.createObserver(element)
        this.watchRatio()

        if (!this.canvas.isConnected)
            this.suspend()
    }

    render() {
        if (this.isDestroyed)
            return

        this.renderer.render()
    }

    destroy() {
        if (this.isDestroyed)
            return

        this.isDestroyed = true

        this.observer.disconnect()
        this.ratioWatcher.abort()
        this.renderer.destroy()

        Theme.detach(this.onThemeChange)
        this.canvas.remove()
    }

    applySettings(settings: ChartSettings) {
        if (this.isDestroyed)
            return

        const previous = this.settings

        this.source = settings
        this.settings = normalize(settings, this.fallbackColor, this.element)

        keepDisabled(previous, this.settings)

        this.bindMenuActions()
        this.applySize()

        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.canvas)
    }

    private bindMenuActions() {
        for (const item of this.settings.contextMenu ?? [])
            if (item.id != undefined)
                item.action ??= data => this.element.dispatchEvent(new CustomEvent(item.id!, { detail: data }))
    }

    private applySize() {
        const { width, height } = this.settings

        if (width)
            this.element.style.width = Chart.toCssSize(width)

        if (height)
            this.element.style.height = Chart.toCssSize(height)
    }

    private static toCssSize(value: string) {
        return Number.isFinite(+value) ? `${ +value }px` : value
    }

    private resize(width: number, height: number, device?: ResizeObserverSize) {
        width = Math.floor(width)
        height = Math.floor(height)

        if (width == 0 || height == 0)
            return

        const ratio = window.devicePixelRatio || 1
        const isExact = device != undefined
                        && Math.abs(device.inlineSize - width * ratio) < 1
                        && Math.abs(device.blockSize - height * ratio) < 1

        const pixelWidth = isExact ? device.inlineSize : Math.round(width * ratio)
        const pixelHeight = isExact ? device.blockSize : Math.round(height * ratio)

        if (this.width == width && this.height == height
            && this.canvas.width == pixelWidth && this.canvas.height == pixelHeight)
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
                if (entry.target == this.canvas)
                    this.resize(this.width, this.height, entry.devicePixelContentBoxSize?.[0])
                else
                    this.resize(entry.contentRect.width, entry.contentRect.height)
            }
        })

        observer.observe(node)

        try {
            observer.observe(this.canvas, { box: 'device-pixel-content-box' })
        } catch {
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

        if (Theme.currentTheme != this.suspendedTheme)
            this.onThemeChange()
    }
}