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

    private settings: ChartSettings

    private readonly fallbackColor = randomColor()

    private readonly canvas: HTMLCanvasElement

    private readonly renderer: Renderer

    private readonly observer: ResizeObserver

    private readonly ratioWatcher = new AbortController()

    private width: number = 0

    private height: number = 0

    private ratio: number = 0

    private readonly onThemeChange = () => {
        this.renderer.apply(this.settings)
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        if (element.clientWidth == 0)
            element.style.width = Styles.Size.Full

        if (element.clientHeight == 0)
            element.style.height = Styles.Size.Full

        this.canvas = createCanvas()
        element.appendChild(this.canvas)

        this.settings = normalize(settings, this.fallbackColor)

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

        this.settings = normalize(settings, this.fallbackColor)

        keepDisabled(previous, this.settings)

        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.canvas)
    }

    private resize(width: number, height: number) {
        width = Math.floor(width)
        height = Math.floor(height)

        if (width == 0 || height == 0)
            return

        const ratio = window.devicePixelRatio || 1

        if (this.width == width && this.height == height && this.ratio == ratio)
            return

        this.width = width
        this.height = height
        this.ratio = ratio

        this.canvas.width = Math.round(width * ratio)
        this.canvas.height = Math.round(height * ratio)
        this.canvas.style.width = `${ width }px`
        this.canvas.style.height = `${ height }px`

        this.renderer.resize(width, height, ratio)
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

            const { width, height } = entries[0].contentRect

            this.resize(width, height)
        })

        observer.observe(node)

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