import Canvas from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Theme from '@/Theme'
import { ChartType, Events } from '@/static/Enums'
import { Renderer } from '@/renderer/Renderer'
import { adjustColor, deepClone, groupBy, normalizeColor, parseNumber, randomColor } from '@/Helper'
import Legend from '@/Legend'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import { TreeValue } from '@/types/data/TreeData'
import Debug from '@/Debug'
import ChartItem from '@/types/ChartItem'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'

const BASE_COLOR_RANGE = 67

// todo: add public api

export default class Chart {
    private isDestroyed: boolean = false

    private isSuspended: boolean = false

    private suspendedTheme: number = 0

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
        this.canvas = Canvas.new()
        element.appendChild(this.canvas)

        this.settings = Chart.normalize(settings, this.fallbackColor)

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

        this.settings = Chart.normalize(settings, this.fallbackColor)

        Chart.keepDisabled(previous, this.settings)

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

    private static normalize(source: ChartSettings, fallbackColor: string): ChartSettings {
        let settings = deepClone(source)

        const charts = settings.charts?.length
                       ? settings.charts.map(chart => ({ ...chart, type: chart.type ?? ChartType.Plot }))
                       : [{ type: settings.type ?? ChartType.Plot, data: settings.data }]

        settings = { ...settings, charts }

        for (const chart of charts) {
            Chart.prepareValues(chart)
            Chart.normalizeValues(chart.data?.values)
        }

        Chart.applyBaseColor(settings, fallbackColor)

        return {
            ...settings,
            enableTooltip: !settings.disableInteractions && settings.enableTooltip,
            enableLegend: charts.some(Legend.isSupported) && settings.enableLegend
        }
    }

    private static prepareValues(chart: ChartItem) {
        if (!chart.data?.values || !Legend.isSupported(chart))
            return

        const counts = new Map<string, number>()

        chart.data.values = chart.data.values.map(value => {
            if (!(value instanceof Value))
                value = chart.type == ChartType.Plot
                        ? new PlotSeries(value)
                        : new Sector(value)

            value.label ??= TextResources.noLabel

            const count = counts.get(value.label) ?? 0

            counts.set(value.label, count + 1)

            value.id ??= `${ value.label }-${ count }`

            return value
        })
    }

    private static keepDisabled(previous: ChartSettings, next: ChartSettings) {
        const getValues = (settings: ChartSettings) => settings.charts.flatMap(chart => chart.data?.values ?? [])
        const getKey = (settings: ChartSettings, value: Value) => Legend.getGroupKey(value, settings.charts.length > 1)

        const disabled = new Map<string, boolean>()

        for (const value of getValues(previous))
            if (value.disabled)
                disabled.set(getKey(previous, value), true)

        for (const value of getValues(next))
            if (value.disabled == undefined && disabled.has(getKey(next, value)))
                value.disabled = true
    }

    private static normalizeValues(values: Value[] | undefined) {
        const toNumber = <T>(value: T) => {
            if (typeof value != 'string' && typeof value != 'number')
                return value

            const number = parseNumber(value)

            return Number.isFinite(number) ? number : 0
        }

        for (const value of values ?? []) {
            value.value = toNumber(value.value)

            if (value.color)
                value.color = normalizeColor(value.color)

            for (const point of (value as PlotSeries).values ?? [])
                point.y = toNumber(point.y)

            Chart.normalizeValues((value as TreeValue).sectors)
        }
    }

    private static applyBaseColor(settings: ChartSettings, fallbackColor: string) {
        const isShared = settings.charts.length > 1
        const groups = groupBy(settings.charts.flatMap(chart => chart.data?.values ?? []),
            (value): string | Value => isShared ? value.label : value)

        for (const values of groups.values()) {
            const color = values.find(value => value.color)?.color

            if (color)
                for (const value of values)
                    value.color ||= color
        }

        const uncolored = Array.from(groups.values()).filter(values => !values[0].color)

        if (uncolored.length == 0)
            return

        const base = settings.baseColor ? normalizeColor(settings.baseColor) : fallbackColor

        uncolored.forEach((values, index) => {
            const ratio = uncolored.length == 1 ? .5 : index / (uncolored.length - 1)
            const color = adjustColor(base, Math.round((ratio * 2 - 1) * BASE_COLOR_RANGE))

            for (const value of values)
                value.color = color
        })
    }
}