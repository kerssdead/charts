import Point from '@/types/Point'
import { DEFAULT_LINE_WIDTH, FONT_FAMILY, Tooltip } from '@/static/constants/Index'
import Theme from '@/Theme'
import { escapeHtml } from '@/helpers/Text'
import FloatingElement from '@/renderer/FloatingElement'
import ItemData from '@/types/ItemData'

const PLACEHOLDER = /\$\{\s*([^}\s]+)\s*}/g

export default class CustomTooltip {
    private readonly canvas: HTMLCanvasElement

    private floating: FloatingElement | null = null

    private html: string | null = null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    static fromTemplate(templateId: string): ((data: ItemData) => string) | null {
        const template = document.getElementById(templateId)

        if (!(template instanceof HTMLTemplateElement))
            return null

        let last: { data: ItemData, html: string } | null = null

        return data => {
            if (last?.data !== data)
                last = {
                    data,
                    html: template.innerHTML.replace(PLACEHOLDER, (_, key: string) => escapeHtml(data[key]))
                }

            return last.html
        }
    }

    static fromText(text: string) {
        const style = `padding: ${ Tooltip.padding }px;
                       border: ${ DEFAULT_LINE_WIDTH }px solid ${ Theme.dropdownBorder };
                       border-radius: ${ Tooltip.radius }px;
                       background: ${ Theme.background };
                       color: ${ Theme.text };
                       font: ${ Tooltip.fontSize }px/${ Tooltip.rowHeight }px ${ FONT_FAMILY };
                       box-sizing: border-box;
                       white-space: pre-wrap;
                       overflow-wrap: anywhere`

        return `<div style="${ style }">${ escapeHtml(text) }</div>`
    }

    show(html: string, point: Point) {
        if (html !== this.html || !this.floating) {
            this.hide()

            this.floating = new FloatingElement(this.canvas, Tooltip.offset)
            this.floating.element.setAttribute('role', 'tooltip')
            this.floating.element.style.pointerEvents = 'none'
            this.floating.element.innerHTML = html
            this.html = html
        }

        this.floating.show(point)
    }

    setOpacity(alpha: number) {
        if (this.floating)
            this.floating.element.style.opacity = String(alpha)
    }

    hide() {
        this.floating?.remove()
        this.floating = null
        this.html = null
    }
}