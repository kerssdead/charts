import { ChartSettings } from './types/ChartSettings'
import { Renderer } from './types/base/Renderer'
import { Data } from './types/interfaces/Data'
import { Legend } from './Legend'
import { Value } from './types/base/Value'
import { PlotRenderer } from './render/PlotRenderer'
import { CircularRenderer } from './render/CircularRenderer'
import { GaugeRenderer } from './render/GaugeRenderer'
import TreeRenderer from './render/TreeRenderer'
import { Animations } from './Animations'
import { Theme } from './Theme'
import { Styles } from './static/constants/Styles'
import { ChartType, Events } from './static/Enums'

export class Chart {
    node: HTMLElement

    settings: ChartSettings

    #renderer: Renderer<Data>

    #legend: Legend

    #observer: ResizeObserver

    constructor(context: HTMLElement, settings: ChartSettings) {
        this.#initialize(settings)

        this.node = context
        this.settings = settings

        this.#applyStyles()
        this.#prepareSettings()

        if (settings.enableLegend)
            this.#legend = new Legend(this)

        document.addEventListener(Events.VisibilityChanged, () => this.#renderer.resetMouse())
        window.addEventListener(Events.Blur, () => this.#renderer.resetMouse())
    }

    render() {
        this.#renderer.render()
        this.#legend?.render()

        this.#observer = new ResizeObserver(() => {
            if (this.#renderer.canvas)
                this.#resize()
            else
                this.destroy()
        })
        this.#observer.observe(this.node)

        this.#refresh()
    }

    destroy() {
        this.#renderer.destroy()
        this.#legend?.destroy()

        this.#observer.disconnect()
    }

    highlight(value?: Value) {
        this.#renderer.highlight(value)
    }

    reset() {
        Theme.reset()

        this.#initialize(this.settings)
    }

    #prepareSettings() {
        this.settings.enableTooltip = !this.settings.disableInteractions && this.settings.enableTooltip

        switch (this.settings.type) {
            case ChartType.Plot:
                this.#renderer = new PlotRenderer(this)
                break

            case ChartType.Circular:
                this.#renderer = new CircularRenderer(this)
                break

            case ChartType.Gauge:
                this.#renderer = new GaugeRenderer(this)
                break

            case ChartType.TreeMap:
                this.#renderer = new TreeRenderer(this)
                break
        }

        this.#renderer.prepareSettings()

        if (!this.settings.disableInteractions) {
            this.#renderer.initDropdown()
            this.#renderer.initAnimations()
        }

        this.#renderer.resize()
    }

    #refresh() {
        this.#renderer.refresh()
        this.#legend?.refresh()
    }

    #resize() {
        this.#renderer.resize()
        this.#legend?.resize()
    }

    #initialize(settings: ChartSettings) {
        Theme.initialize(
            () => this.#resize(),
            settings.isDarkThemeFunction
        )
        Animations.initializeTransitions()
    }

    #applyStyles() {
        this.node.style.display = Styles.Display.Flex
        this.node.style.flexDirection = Styles.FlexDirection.Column
        this.node.style.alignItems = Styles.AlignItems.Center
        this.node.style.justifyContent = Styles.JustifyContent.Center
        this.node.style.height = '100%'
    }
}