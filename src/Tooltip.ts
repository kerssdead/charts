import Value from 'types/base/Value'
import Theme from 'Theme'
import TextStyles from 'helpers/TextStyles'
import * as Helper from 'Helper'
import ChartSettings from 'types/ChartSettings'
import TooltipValue from 'types/TooltipValue'
import Data from 'types/interfaces/Data'
import Canvas from 'helpers/Canvas'
import * as Constants from 'static/constants/Index'
import Styles from 'static/constants/Styles'
import HTMLTooltipElement from 'types/extends/HTMLTooltipElement'
import { Attribute, Tag } from 'static/Enums'

class Tooltip {
    canvas: HTMLCanvasElement

    data: Data

    readonly #enabled: boolean

    readonly #isCustom: boolean

    #canvasPosition: DOMRect

    #template: HTMLTemplateElement

    #inProgress: boolean

    #toHide: boolean

    #timer: Date | undefined

    #lines: TooltipValue[]

    constructor(canvas: HTMLCanvasElement, settings: ChartSettings) {
        this.canvas = canvas
        this.data = settings.data
        this.#enabled = settings.enableTooltip
        this.#isCustom = !!settings.templateId

        if (this.#isCustom)
            this.#template = <HTMLTemplateElement>document.getElementById(settings.templateId)

        this.refresh()
    }

    render(condition: boolean, event: MouseEvent, lines: TooltipValue[], value?: Value) {
        this.#hideAll()

        if (!this.#enabled || !event)
            return

        if (condition || this.#inProgress || this.#toHide) {
            if (condition)
                this.#lines = lines

            if (!this.#timer)
                this.#timer = new Date()

            if (!this.#toHide)
                this.#inProgress = true
            else if (this.#inProgress)
                this.#timer = new Date()

            if (this.#isCustom)
                this.#renderCustom(event, value)
            else
                this.#renderRegular(event)

            const opacityValue = this.#getOpacityValue()

            if (this.#toHide && opacityValue >= 1) {
                this.#inProgress = false
                this.#toHide = false
            }

            if (this.#toHide && opacityValue <= 0) {
                this.#inProgress = false
                this.#toHide = false
                this.#timer = undefined
            }

            if (!condition && this.#timer != undefined)
                this.#toHide = true
        } else {
            this.#timer = undefined
        }
    }

    #renderRegular(event: MouseEvent) {
        const ctx = Canvas.getContext(this.canvas)

        const textWidth = Math.max(...this.#lines.map(line => Helper.stringWidth(line.text ?? '') + (line.color ? 8 : 0)))

        const padding = 6,
            borderRadius = 6

        let x = event.clientX - this.#canvasPosition.x + 10,
            y = event.clientY - this.#canvasPosition.y + scrollY + 10

        if (x + textWidth + 25 > this.#canvasPosition.width)
            x = this.#canvasPosition.width - (textWidth + 25)

        if (y + 15 + this.#lines.length * 18 > this.#canvasPosition.height)
            y = this.#canvasPosition.height - 15 - this.#lines.length * 18

        ctx.beginPath()
        ctx.roundRect(x, y, textWidth + 24, 16 + 16 * this.#lines.length, borderRadius)
        let opacity = Math.round(this.#getOpacityValue() * 255).toString(16),
            baseOpacity = Math.round(this.#getOpacityValue() * 207).toString(16)
        if (opacity.length == 1)
            opacity = '0' + opacity
        if (baseOpacity.length == 1)
            baseOpacity = '0' + baseOpacity

        ctx.strokeStyle = Theme.dropdownBorder + baseOpacity
        ctx.lineWidth = 1
        ctx.fillStyle = Theme.background + baseOpacity
        ctx.stroke()
        ctx.fill()

        for (let line of this.#lines) {
            let offset = 0

            if (line.color) {
                offset = 12

                ctx.beginPath()
                ctx.fillStyle = line.color + opacity
                ctx.arc(x + 16, y + 17, 5, 0, Math.PI * 2)
                ctx.fill()
            }

            TextStyles.tooltip(ctx)
            ctx.fillStyle = Theme.text + opacity
            ctx.fillText(line.text ?? '', x + offset + padding * 2, y + 21)

            y += 16
        }
    }

    #renderCustom(event: MouseEvent, value?: Value) {
        if (value == undefined)
            return

        const id = this.#template.id + value.id

        let tooltip = <HTMLTooltipElement>document.getElementById(id)

        const updateVisibility = () => {
            this.#hideAll()

            tooltip.style.visibility = Styles.Visibility.Visible
        }

        if (!tooltip) {
            const regex = /\${[^}]*}/gm

            let content = <HTMLElement>this.#template.cloneNode(true)

            tooltip = document.createElement(Tag.Div) as HTMLTooltipElement

            tooltip.innerHTML = content.innerHTML

            tooltip.id = id
            tooltip.style.position = Styles.Position.Absolute
            tooltip.style.pointerEvents = Styles.PointerEvents.None
            tooltip.style.visibility = Styles.Visibility.Visible

            tooltip.setAttribute(Attribute.Name, this.#template.id)

            const matches = [...tooltip.innerHTML.matchAll(regex)]

            let html = tooltip.innerHTML

            for (const match of matches) {
                const property = match[0].replace('${', '')
                                         .replace('}', '')
                                         .replaceAll(' ', '')

                html = html.replaceAll(match[0], value.data[property])
            }

            tooltip.innerHTML = html

            document.body.appendChild(tooltip)

            tooltip.position = tooltip.getBoundingClientRect()

            updateVisibility()
        }

        if (tooltip.style.visibility == Styles.Visibility.Hidden)
            updateVisibility()

        if (tooltip.position.height == 0)
            tooltip.position = tooltip.getBoundingClientRect()

        const offset = 10

        let opacity = '1'

        let x = event.clientX,
            y = event.clientY + scrollY

        if (x + tooltip.position.width - this.#canvasPosition.x > this.#canvasPosition.width - offset) {
            x = this.#canvasPosition.width - tooltip.position.width + this.#canvasPosition.x - offset
            opacity = '.67'
        }

        if (y + tooltip.position.height - this.#canvasPosition.y > this.#canvasPosition.height - offset) {
            y = this.#canvasPosition.height - tooltip.position.height + this.#canvasPosition.y - offset
            opacity = '.67'
        }

        if (x == 0 && y == 0)
            opacity = '0'

        tooltip.style.left = x + offset + 'px'
        tooltip.style.top = y + offset + 'px'
        tooltip.style.opacity = opacity
    }

    refresh() {
        this.#canvasPosition = this.canvas.getBoundingClientRect()
        this.#canvasPosition.x += scrollX
        this.#canvasPosition.y += scrollY
    }

    #hideAll() {
        if (!this.#isCustom)
            return

        const tooltips = <NodeListOf<HTMLElement>>document.querySelectorAll(`[name="${ this.#template.id }"]`)

        for (let node of tooltips)
            node.style.visibility = Styles.Visibility.Hidden
    }

    #getOpacityValue(): number {
        if (!this.#timer)
            return 0

        let opacityValue = this.#toHide
                           ? 1 - (new Date().getTime() - this.#timer.getTime()) / Constants.Animations.tooltip
                           : (new Date().getTime() - this.#timer.getTime()) / Constants.Animations.tooltip
        if (opacityValue > 1)
            opacityValue = 1
        if (opacityValue < 0)
            opacityValue = 0

        return opacityValue
    }
}

export default Tooltip