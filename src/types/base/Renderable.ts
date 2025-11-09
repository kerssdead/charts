import { ChartSettings } from 'types/ChartSettings'
import { Animations } from 'Animations'
import { Tooltip } from 'Tooltip'
import { Dropdown } from 'Dropdown'
import { Chart } from 'Chart'
import { Canvas } from 'helpers/Canvas'
import { Events, RenderState, Tag } from 'static/Enums'
import { Styles } from 'static/constants/Styles'
import { Theme } from 'Theme'

export class Renderable {
    node: HTMLElement

    canvas: HTMLCanvasElement

    settings: ChartSettings

    animations: Animations

    tooltip: Tooltip

    protected state: RenderState = RenderState.Init

    protected canvasPosition: DOMRect

    protected moveEvent: MouseEvent

    protected clickEvent: MouseEvent | undefined

    protected menuEvent: MouseEvent | undefined

    protected contextMenu: Dropdown | undefined

    constructor(chart: Chart) {
        this.node = chart.node
        this.settings = chart.settings
        this.animations = new Animations()

        this.canvas = document.createElement(Tag.Canvas)

        this.canvas.style.imageRendering = Styles.ImageRendering.Pixelated

        this.node.append(this.canvas)

        this.initAnimations()
    }

    render() {
        const ctx = Canvas.getContext(this.canvas)

        ctx.fillStyle = Theme.canvasBackground
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    refresh() {
        this.tooltip.refresh()
        this.state = this.settings.disableInitAnimation ? RenderState.Idle : RenderState.Init
    }

    resetMouse() {
        this.moveEvent = new MouseEvent(Events.MouseMove)
        this.clickEvent = new MouseEvent(Events.Click)
        this.menuEvent = undefined
    }

    initAnimations() {
        this.tooltip = new Tooltip(this.canvas, this.settings)

        this.canvasPosition = this.canvas.getBoundingClientRect()

        this.canvasPosition.x += scrollX
        this.canvasPosition.y += scrollY

        if (this.state == RenderState.Init && !this.settings.disableInteractions) {
            this.canvas.onmousemove = event => this.moveEvent = event
            this.canvas.onclick = event => this.clickEvent = event
            this.canvas.oncontextmenu = event => {
                event.preventDefault()
                this.contextMenu = undefined
                if (this.menuEvent)
                    this.menuEvent = undefined
                else
                    this.menuEvent = event
            }
            this.canvas.onmouseleave = () => this.moveEvent = new MouseEvent(Events.MouseMove)
        }
    }

    destroy() {
        this.canvas.remove()
    }
}