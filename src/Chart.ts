import ChartSettings from 'types/ChartSettings'
import Legend from 'Legend'
import Animations from 'Animations'
import Theme from 'Theme'
import Styles from 'static/constants/Styles'
import { ChartType, Tag } from 'static/Enums'
import Debug from 'Debug'
import { DefaultRenderer } from './render/DefaultRenderer'

class Chart {
    node: HTMLElement

    settings: ChartSettings

    private renderer: DefaultRenderer

    private legend: Legend | undefined

    private observer: ResizeObserver | undefined

    private canvas: HTMLCanvasElement

    private initialStyles: string

    private isDestroyed: boolean = false

    private readonly onThemeChange = () => {
        this.resize()
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        this.node = element

        this.canvas = document.createElement(Tag.Canvas)

        this.resize()

        this.node.appendChild(this.canvas)

        this.applyStyles()
        this.attachEvents()

        this.ctor(settings)
    }

    ctor(settings: ChartSettings) {
        this.renderer ??= new DefaultRenderer(this.canvas, settings)

        this.applySettings(settings)
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

        this.renderer?.destroy()

        this.legend?.destroy()
        this.legend = undefined

        this.observer?.disconnect()
        this.observer = undefined

        Theme.detach(this.onThemeChange)

        this.canvas.remove()

        this.node.style.cssText = this.initialStyles
    }

    reset() {
        Theme.reset()

        this.initialize(this.settings)
    }

    applySettings(settings: ChartSettings) {
        this.settings = settings

        this.reset()
        this.prepareSettings()
        this.syncLegend()
        this.resize()

        this.renderer.apply(this.settings)
        this.renderer.render()
    }

    private syncLegend() {
        if (!this.settings.enableLegend) {
            this.removeLegend()

            return
        }

        if (this.legend != undefined) {
            this.legend.applySettings(this.settings)

            return
        }

        this.legend = new Legend(this)

        this.renderer.setLegend(this.legend)
    }

    private removeLegend() {
        if (this.legend == undefined)
            return

        this.renderer.setLegend(undefined)

        this.legend.destroy()
        this.legend = undefined
    }
    private prepareSettings() {
        // todo: check
        this.settings.enableTooltip = !this.settings.disableInteractions && this.settings.enableTooltip

        if (this.settings.type == ChartType.Gauge || this.settings.type == ChartType.TreeMap)
            this.settings.enableLegend = false
    }

    private resize() {
        if (this.isDestroyed)
            return

        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = domRect.width
        this.canvas.height = domRect.height

        this.legend?.resize(this.canvas.width, this.canvas.height)

        this.renderer?.calculateWindow(this.legend?.reserved ?? null)
    }

    private initialize(settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)
        Theme.initialize(
            this.onThemeChange,
            settings.isDarkThemeFunction
        )
        Animations.initializeTransitions()
    }

    private applyStyles() {
        this.initialStyles = this.node.style.cssText

        this.node.style.display = Styles.Display.Flex
        this.node.style.flexDirection = Styles.FlexDirection.Column
        this.node.style.alignItems = Styles.AlignItems.Center
        this.node.style.justifyContent = Styles.JustifyContent.Center
        this.node.style.height = '100%'
    }

    private initializeObserver() {
        if (this.observer != undefined)
            return

        this.observer = new ResizeObserver(() => {
            // todo: if canvas is not exist on page then destroy chart completely
            this.resize()
        })

        this.observer.observe(this.node)
    }

    private attachEvents() {
        // todo: reset mouse position when alt+tab browser ?

        this.initializeObserver()
    }
}

export default Chart