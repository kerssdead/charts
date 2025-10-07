class Renderable {
    node: HTMLElement

    canvas: HTMLCanvasElement

    settings: ChartSettings

    animations: Animations

    tooltip: Tooltip

    protected state: RenderState = RenderState.Init

    protected canvasPosition: DOMRect

    protected onMouseMoveEvent: MouseEvent

    protected onClickEvent: MouseEvent | undefined

    protected onContextMenuEvent: MouseEvent | undefined

    protected contextMenu: Dropdown | undefined

    constructor(chart: Chart) {
        this.node = chart.node
        this.settings = chart.settings
        this.animations = new Animations()

        this.canvas = document.createElement(Tag.Canvas)

        this.canvas.style.imageRendering = Styles.ImageRendering.Pixelated

        this.node.append(this.canvas)

        this.tooltip = new Tooltip(this.canvas, this.settings)

        this.initAnimations()
    }

    render() {
        const ctx = Canvas.getContext(this.canvas)

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    refresh() {
        this.tooltip.refresh()
        this.state = this.settings.disableInitAnimation ? RenderState.Idle : RenderState.Init
    }

    resetMouse() {
        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove)
        this.onClickEvent = new MouseEvent(Events.Click)
        this.onContextMenuEvent = undefined
    }

    initAnimations() {
        this.canvasPosition = this.canvas.getBoundingClientRect()

        this.canvasPosition.x += scrollX
        this.canvasPosition.y += scrollY

        if (this.state == RenderState.Init && !this.settings.disableInteractions) {
            this.canvas.onmousemove = event => this.onMouseMoveEvent = event
            this.canvas.onclick = event => this.onClickEvent = event
            this.canvas.oncontextmenu = event => {
                event.preventDefault()
                this.contextMenu = undefined
                if (this.onContextMenuEvent)
                    this.onContextMenuEvent = undefined
                else
                    this.onContextMenuEvent = event
            }
            this.canvas.onmouseleave = () => {
                this.onMouseMoveEvent = new MouseEvent(Events.MouseMove)
                this.onClickEvent = undefined
            }
        }
    }
}