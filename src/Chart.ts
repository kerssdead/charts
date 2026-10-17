import Animations from 'Animations'
import Canvas from 'helpers/Canvas'
import ChartSettings from 'types/ChartSettings'
import Theme from 'Theme'
import { ChartType } from 'static/Enums'
import { Renderer } from 'renderer/Renderer'
import { adjustColor, randomColor } from 'Helper'

const BASE_COLOR_RANGE = 67

export default class Chart {
    private isDestroyed: boolean = false

    private settings: ChartSettings

    private readonly canvas: HTMLCanvasElement

    private readonly renderer: Renderer

    private readonly observer: ResizeObserver

    private readonly onThemeChange = () => {
        this.renderer.apply(this.settings)
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        this.canvas = Canvas.new()
        element.appendChild(this.canvas)

        this.settings = Chart.normalize(settings)

        Theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)
        Animations.initializeTransitions()

        this.renderer = new Renderer(this.canvas)
        this.renderer.apply(this.settings)

        this.observer = this.createObserver(element)
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
        this.renderer.destroy()

        Theme.detach(this.onThemeChange)
        this.canvas.remove()
    }

    applySettings(settings: ChartSettings) {
        if (this.isDestroyed)
            return

        this.settings = Chart.normalize(settings)

        Theme.update(this.settings.isDarkThemeFunction)
        this.renderer.apply(this.settings)
    }

    private resize(width: number, height: number) {
        width = Math.floor(width)
        height = Math.floor(height)

        if (width == 0 || height == 0)
            return

        if (this.canvas.width == width && this.canvas.height == height)
            return

        this.canvas.width = width
        this.canvas.height = height

        this.renderer.resize(width, height)
        this.renderer.render()
    }

    private createObserver(node: HTMLElement) {
        const observer = new ResizeObserver(entries => {
            if (!this.canvas.isConnected) {
                if (this.canvas.width > 0)
                    this.destroy()

                return
            }

            const { width, height } = entries[0].contentRect

            this.resize(width, height)
        })

        observer.observe(node)

        return observer
    }

    private static normalize(settings: ChartSettings): ChartSettings {
        const isLegendSupported = settings.type != ChartType.Gauge && settings.type != ChartType.TreeMap

        Chart.applyBaseColor(settings)

        return {
            ...settings,
            enableTooltip: !settings.disableInteractions && settings.enableTooltip,
            enableLegend: isLegendSupported && settings.enableLegend
        }
    }

    private static applyBaseColor(settings: ChartSettings) {
        const values = (settings.data?.values ?? []).filter(value => {
            return !value.color || (!!settings.baseColor && value.isColorGenerated)
        })

        if (values.length == 0)
            return

        const base = settings.baseColor || randomColor()

        values.forEach((value, index) => {
            const ratio = values.length == 1 ? .5 : index / (values.length - 1)

            value.color = adjustColor(base, Math.round((ratio * 2 - 1) * BASE_COLOR_RANGE))

            value.isColorGenerated = true
        })
    }
}