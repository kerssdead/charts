class Renderable {
    node: HTMLElement

    canvas: HTMLCanvasElement

    settings: ChartSettings

    animations: Animations

    tooltip: Tooltip

    protected isInit = false

    protected canvasPosition: DOMRect

    protected onMouseMoveEvent: MouseEvent

    protected onClickEvent: MouseEvent | undefined

    constructor(node: HTMLElement, settings: ChartSettings) {
        this.node = node
        this.settings = settings
        this.animations = new Animations()

        this.canvas = document.createElement(Tag.Canvas)

        this.node.append(this.canvas)

        this.tooltip = new Tooltip(this.canvas, settings)

        this.initAnimations()
    }

    render() {
        const ctx = Helpers.Canvas.getContext(this.canvas)

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    refresh() {
        this.tooltip.refresh()
        this.isInit = false
    }

    resetMouse() {
        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove)
        this.onClickEvent = new MouseEvent(Events.Click)
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
}