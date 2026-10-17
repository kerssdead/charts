import Animations from 'Animations'
import Canvas from 'helpers/Canvas'
import ChartSettings from 'types/ChartSettings'
import Theme from 'Theme'
import { ChartType } from 'static/Enums'
import { Renderer } from 'renderer/Renderer'
import { adjustColor, randomColor } from 'Helper'
import Legend from 'Legend'
import Value from 'types/base/Value'

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
        const charts = settings.charts?.length
                       ? settings.charts.map(chart => ({ ...chart, type: chart.type ?? ChartType.Plot }))
                       : [{ type: settings.type, data: settings.data }]

        settings = { ...settings, charts }

        Chart.applyBaseColor(settings)

        return {
            ...settings,
            enableTooltip: !settings.disableInteractions && settings.enableTooltip,
            enableLegend: charts.some(Legend.isSupported) && settings.enableLegend
        }
    }

    private static applyBaseColor(settings: ChartSettings) {
        const isShared = settings.charts.length > 1
        const groups = new Map<string | Value, Value[]>()

        for (const chart of settings.charts) {
            for (const value of chart.data?.values ?? []) {
                const key = isShared ? value.label : value

                groups.set(key, [...groups.get(key) ?? [], value])
            }
        }

        const needsColor = (value: Value) => !value.color || (!!settings.baseColor && !!value.isColorGenerated)

        const uncolored = Array.from(groups.values()).filter(values => values.every(needsColor))

        for (const values of groups.values()) {
            const color = values.find(value => !needsColor(value))?.color

            if (color)
                for (const value of values.filter(needsColor))
                    value.color = color
        }

        if (uncolored.length == 0)
            return

        const base = settings.baseColor || randomColor()

        uncolored.forEach((values, index) => {
            const ratio = uncolored.length == 1 ? .5 : index / (uncolored.length - 1)
            const color = adjustColor(base, Math.round((ratio * 2 - 1) * BASE_COLOR_RANGE))

            for (const value of values) {
                value.color = color
                value.isColorGenerated = true
            }
        })
    }
}