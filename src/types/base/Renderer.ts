class Renderer<T extends Data> {
    node: HTMLElement

    canvas: HTMLCanvasElement

    settings: ChartSettings

    animations: Animations

    tooltip: Tooltip

    dropdown: Dropdown

    data: T

    protected isInit = false

    protected canvasPosition: DOMRect

    protected onMouseMoveEvent: MouseEvent

    protected onClickEvent: MouseEvent | undefined

    constructor(node: HTMLElement, settings: ChartSettings) {
        this.node = node
        this.settings = settings
        this.animations = new Animations()

        this.data = <T>settings.data

        this.canvas = document.createElement(Tag.Canvas)

        this.node.append(this.canvas)

        this.#calculateSizes()

        this.tooltip = new Tooltip(this.canvas, settings)
    }

    render() {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.settings.title) {
            Helpers.TextStyles.title(ctx)
            ctx.fillText(this.settings.title, this.canvas.width / 2, 40)
        }

        this.onClickEvent = this.dropdown?.render(this.onMouseMoveEvent, this.onClickEvent)
    }

    refresh() {
        this.tooltip.refresh()
        this.isInit = false
    }

    resize() {
        this.tooltip.refresh()
        this.#calculateSizes()
    }

    resetMouse() {
        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove)
        this.onClickEvent = new MouseEvent(Events.Click)
    }

    prepareSettings() {
        const dimension = this.node.parentElement!.getBoundingClientRect()

        if (!this.settings.width || +this.settings.width == 0)
            this.settings.width = dimension.width
        if (!this.settings.height || +this.settings.height == 0)
            this.settings.height = dimension.height

        const baseColor = this.settings.baseColor ?? Helper.randomColor()
        let adjustStep = Math.round(100 / this.settings.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        for (let item of this.settings.data.values) {
            item.id = Helper.guid()
            item.color ??= Helper.adjustColor(baseColor, adjustAmount += adjustStep)
        }
    }

    initAnimations() {
        this.canvasPosition = this.canvas.getBoundingClientRect()

        this.canvasPosition.x += scrollX
        this.canvasPosition.y += scrollY

        if (!this.isInit) {
            this.canvas.onmousemove = event => this.onMouseMoveEvent = event
            this.canvas.onclick = event => this.onClickEvent = event
        }
    }

    #calculateSizes() {
        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = this.settings.width < domRect.width || domRect.width == 0
            ? this.settings.width
            : domRect.width
        this.canvas.height = this.settings.height < domRect.height || domRect.height == 0
            ? this.settings.height
            : domRect.height

        if (this.settings.enableLegend) {
            if (this.settings.legendPlace == LegendPlace.Top
                || this.settings.legendPlace == LegendPlace.Bottom)
                this.canvas.height -= Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

            if (this.settings.legendPlace == LegendPlace.Left
                || this.settings.legendPlace == LegendPlace.Right)
                this.canvas.width -= 500
        }
    }
}