class Chart {
    node: HTMLChartElement

    settings: ChartSettings

    #renderer: Renderer<Data>

    #legend: Legend

    #observer: ResizeObserver

    constructor(context: HTMLChartElement, settings: ChartSettings) {
        this.#initialize()

        context.chart = this

        this.node = context
        this.node.style.display = 'flex'
        this.node.style.flexDirection = 'column'
        this.node.style.alignItems = 'center'

        this.settings = settings

        this.#prepareSettings()

        if (settings.enableLegend) {
            this.#legend = new Legend(context, settings)

            if (settings.legendPlace == undefined
                || settings.legendPlace == LegendPlace.Bottom
                || settings.legendPlace == LegendPlace.Top)
                settings.maxHeight -= this.#legend.canvas.height
        }

        document.addEventListener(Events.VisibilityChanged, () => this.#renderer.resetMouse())
        window.addEventListener(Events.Blur, () => this.#renderer.resetMouse())
    }

    render() {
        this.#renderer.render()
        this.#legend?.render()

        this.#observer = new ResizeObserver(() => this.#resize())
        this.#observer.observe(this.node)

        this.#refresh()
    }

    #prepareSettings() {
        switch (this.settings.type) {
            case ChartType.Plot:
                this.#renderer = new PlotRenderer(this.node, this.settings)
                break

            case ChartType.Circular:
                this.#renderer = new CircularRenderer(this.node, this.settings)
                break

            case ChartType.Gauge:
                this.#renderer = new GaugeRenderer(this.node, this.settings)
                break

            case ChartType.TreeMap:
                this.#renderer = new TreeRenderer(this.node, this.settings)
                break
        }

        this.#renderer.prepareSettings()
    }

    #refresh() {
        this.#renderer.refresh()
        this.#legend?.refresh()
    }

    #resize() {
        this.#renderer.resize()
        this.#legend?.resize()
    }

    #initialize() {
        Animations.initializeTransitions()
    }
}