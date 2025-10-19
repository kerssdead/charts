import { ChartSettings } from 'types/ChartSettings'
import { Renderer } from 'types/base/Renderer'
import { Data } from 'types/interfaces/Data'
import { Legend } from 'Legend'
import { Value } from 'types/base/Value'
import { PlotRenderer } from 'render/PlotRenderer'
import { CircularRenderer } from 'render/CircularRenderer'
import { GaugeRenderer } from 'render/GaugeRenderer'
import { TreeRenderer } from 'render/TreeRenderer'
import { Animations } from 'Animations'
import { Theme } from 'Theme'
import { Styles } from 'static/constants/Styles'
import { ChartType, Events } from 'static/Enums'

export class Chart {
    node: HTMLElement

    settings: ChartSettings

    #renderer: Renderer<Data>

    #legend: Legend | undefined

    #observer: ResizeObserver

    #currentType: ChartType

    constructor(context: HTMLElement, settings: ChartSettings) {
        this.node = context

        this.applySettings(settings)

        this.#applyStyles()

        document.addEventListener(Events.VisibilityChanged, () => this.#renderer.resetMouse())
        window.addEventListener(Events.Blur, () => this.#renderer.resetMouse())

        window.addEventListener(Events.Click, event => {
            if (event.target != this.#renderer.canvas)
                this.#renderer.closeDropdowns()
        })
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

    applySettings(settings: ChartSettings) {
        this.settings = settings

        this.reset()

        const isNeedRestartRender = this.settings.type != this.#currentType

        this.#prepareSettings()

        if (this.settings.enableLegend && this.#legend != undefined)
            this.#legend.applySettings(settings)

        if (this.settings.enableLegend && this.#legend == undefined) {
            this.#legend = new Legend(this)

            this.#legend.render()
        }

        if (!this.settings.enableLegend && this.#legend != undefined) {
            this.#legend.destroy()

            this.#legend = undefined
        }

        if (isNeedRestartRender)
            this.#renderer.render()
    }

    #prepareSettings() {
        this.settings.enableTooltip = !this.settings.disableInteractions && this.settings.enableTooltip

        if (this.#renderer == undefined || this.settings.type != this.#currentType) {
            this.#renderer?.destroy()

            switch (this.settings.type) {
                case ChartType.Plot:
                    this.#renderer = new PlotRenderer(this)
                    this.#currentType = ChartType.Plot
                    break

                case ChartType.Circular:
                    this.#renderer = new CircularRenderer(this)
                    this.#currentType = ChartType.Circular
                    break

                case ChartType.Gauge:
                    this.#renderer = new GaugeRenderer(this)
                    this.#currentType = ChartType.Gauge
                    break

                case ChartType.TreeMap:
                    this.#renderer = new TreeRenderer(this)
                    this.#currentType = ChartType.TreeMap
                    break
            }
        } else {
            this.#renderer.applySettings(this.settings)
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