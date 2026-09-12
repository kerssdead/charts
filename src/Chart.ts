import ChartSettings from 'types/ChartSettings'
import Legend from 'Legend'
import Value from 'types/base/Value'
import Animations from 'Animations'
import Theme from 'Theme'
import Styles from 'static/constants/Styles'
import { Tag } from 'static/Enums'
import Debug from 'Debug'
import { DefaultRenderer } from './render/DefaultRenderer'

class Chart {
    node: HTMLElement

    settings: ChartSettings

    private renderer: DefaultRenderer

    private legend: Legend | undefined

    private observer: ResizeObserver

    private canvas: HTMLCanvasElement

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
        // todo: remove after debug
        settings.enableDebugMode = true
        // todo: remove after debug
        settings.enableMove = true

        this.renderer = new DefaultRenderer(this.canvas, settings)
        this.renderer.add(settings.type, settings.data)

        this.applySettings(settings)
    }

    render() {
        this.renderer.render()
        this.legend?.render()

        this.refresh()
    }

    destroy() {
        // todo: add destroy to DefaultRenderer
        // this.renderer.destroy()
        this.legend?.destroy()

        this.observer.disconnect()
    }

    // todo: remove ?
    highlight(value?: Value) {
        // todo: highlight values via charts field
        // this.renderer.highlight(value)
    }

    reset() {
        Theme.reset()

        this.initialize(this.settings)
    }

    applySettings(settings: ChartSettings) {
        this.settings = settings

        this.reset()

        // const isNeedRestartRender = this.settings.type != this.currentType

        this.prepareSettings()

        // if (this.settings.enableLegend && this.legend != undefined)
        //     this.legend.applySettings(settings)

        // if (this.settings.enableLegend && this.legend == undefined) {
        //     this.legend = new Legend(this)
        //
        //     this.legend.render()
        // }

        // if (!this.settings.enableLegend && this.legend != undefined) {
        //     this.legend.destroy()
        //
        //     this.legend = undefined
        // }

        // if (isNeedRestartRender)
            this.renderer.render()
    }

    private prepareSettings() {
        this.settings.enableTooltip = !this.settings.disableInteractions && this.settings.enableTooltip

        // if (this.renderer == undefined || this.settings.type != this.currentType) {
            // this.renderer?.destroy()

            // switch (this.settings.type) {
            //     case ChartType.Plot:
            //         this.renderer = new PlotRenderer(this)
            //         this.currentType = ChartType.Plot
            //         break
            //
            //     case ChartType.Circular:
            //         this.renderer = new PieProcess(this)
            //         this.currentType = ChartType.Circular
            //         break
            //
            //     case ChartType.Gauge:
            //         this.renderer = new GaugeRenderer(this)
            //         this.currentType = ChartType.Gauge
            //         break
            //
            //     case ChartType.TreeMap:
            //         this.renderer = new TreeRenderer(this)
            //         this.currentType = ChartType.TreeMap
            //         break
            // }
        // } else {
            // todo: add applying new settings without creating new chart
            // this.renderer.applySettings(this.settings)
        // }

        // this.renderer.prepareSettings()

        // todo: move to DefaultRenderer
        // if (!this.settings.disableInteractions) {
        //     this.renderer.initDropdown()
        //     this.renderer.initAnimations()
        // }

        // todo: implement resize just by using like real canvas with abstract position on 2d space
        // this.renderer.resize()
    }

    private refresh() {
        // todo: for what refresh needed in DefaultRenderer() ?
        // this.renderer.refresh()
        this.legend?.refresh()
    }

    private resize() {
        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = domRect.width
        this.canvas.height = domRect.height

        this.renderer?.calculateWindow()

        // todo:   vvv   old code   vvv

        // todo: if use abstract coords in 2d position then .resize() function in not needed more
        // this.renderer.resize()
        this.legend?.resize()

        // todo:   ^^^   old code   ^^^
    }

    private initialize(settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)
        Theme.initialize(
            () => this.resize(),
            settings.isDarkThemeFunction
        )
        Animations.initializeTransitions()
    }

    private applyStyles() {
        this.node.style.display = Styles.Display.Flex
        this.node.style.flexDirection = Styles.FlexDirection.Column
        this.node.style.alignItems = Styles.AlignItems.Center
        this.node.style.justifyContent = Styles.JustifyContent.Center
        this.node.style.height = '100%'
    }

    private initializeObserver() {
        if (this.observer != undefined)
            return

        const chart = this

        this.observer = new ResizeObserver(() => {
            // todo: if canvas is not exist on page then destroy chart completely
            chart.resize()
        })

        this.observer.observe(this.node)
    }

    private attachEvents() {
        // todo: reset mouse position when alt+tab browser ?
        // document.addEventListener(Events.VisibilityChanged, () => this.renderer.resetMouse())
        // window.addEventListener(Events.Blur, () => this.renderer.resetMouse())

        // todo: close dropdowns when mouse is clicked outside canvas
        // window.addEventListener(Events.Click, event => {
        //     if (event.target != this.renderer.canvas)
        //         this.renderer.closeDropdowns()
        // })

        this.initializeObserver()
    }
}

export default Chart