class Chart {
    node: HTMLChartElement

    data: Data

    settings: ChartSettings

    #renderer: Renderer

    #legend: Legend

    #observer: ResizeObserver

    constructor(context: HTMLChartElement, settings: ChartSettings) {
        this.#initialize()

        context.chart = this

        this.node = context
        this.node.style.display = 'flex'
        this.node.style.flexDirection = 'column'
        this.node.style.alignItems = 'center'

        this.data = settings.data
        this.settings = settings

        this.#prepareSettings()

        if (this.settings.enableLegend)
            this.#legend = new Legend(this, context)

        document.addEventListener('visibilitychange', () => this.#renderer.resetMouse())
        window.addEventListener('blur', () => this.#renderer.resetMouse())
    }

    render() {
        this.#renderer.render()
        this.#legend?.render()

        this.#observer = new ResizeObserver(() => this.#resize())
        this.#observer.observe(this.node)

        this.#refresh()
    }

    #prepareSettings() {
        const baseColor = this.settings.baseColor ?? Helper.randomColor()
        let adjustStep = Math.round(100 / this.settings.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        const isPlot = this.settings.type === ChartType.Plot,
            isCircular = this.settings.type === ChartType.Circular

        for (let item of this.settings.data.values) {
            item.id = Helper.guid()
            item.color ??= Helper.adjustColor(baseColor, adjustAmount += adjustStep)
            item.disabled = isPlot ? !(<OPlotSeries>item).values : !(<Sector>item).value
            if (isCircular)
                (<Sector>item).value ??= 0

            let asPlot = item as OPlotSeries
            if (isPlot) {
                asPlot.type ??= PlotType.Line
                for (let it of asPlot.values) {
                    it.id = Helper.guid()
                    if ((<PlotData>this.settings.data).xType === PlotAxisType.Date) {
                        if (typeof it.x === 'string' && Helper.isISOString(it.x))
                            it.x = new Date(it.x)
                        else
                            console.warn(`${it.x} is not a date in ISO format.`)
                    }
                }
            }
        }

        if (isCircular && (<CircularData>this.settings.data).values.filter(v => v.value < 0)) {
            for (const item of (<CircularData>this.settings.data).values.filter(v => v.value < 0))
                console.warn(`"${item.label}" has negative value (${item.value}) and will not be render`)

            this.settings.data.values = this.settings.data.values.filter(v => (<Sector>v).value >= 0)
        }

        const dimension = (<HTMLElement>this.node.parentNode).getBoundingClientRect()

        if (!this.settings.width || +this.settings.width === 0)
            this.settings.width = dimension.width
        if (!this.settings.height || +this.settings.height === 0)
            this.settings.height = dimension.height

        this.settings.legendPlace ??= LegendPlace.Bottom

        switch (this.settings.type) {
            case ChartType.Plot:
                this.#renderer = new PlotRenderer(this, this.settings)
                break

            case ChartType.Circular:
                this.#renderer = new CircularRenderer(this, this.settings)
                break

            case ChartType.Gauge:
                this.#renderer = new GaugeRenderer(this, this.settings)
                break

            case ChartType.TreeMap:
                this.#renderer = new TreeRenderer(this, this.settings)
                break
        }
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