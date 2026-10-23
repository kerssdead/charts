import Point from '@/types/Point'
import Styles from '@/static/constants/Styles'
import { Tag } from '@/static/Enums'
import { DEFAULT_LINE_WIDTH, FONT_FAMILY, Tooltip } from '@/static/constants/Index'
import Theme from '@/Theme'
import { escapeHtml } from '@/helpers/Text'
import { placeNear } from '@/helpers/Geometry'
import ItemData from '@/types/ItemData'

const PLACEHOLDER = /\$\{\s*([^}\s]+)\s*}/g

export default class CustomTooltip {
    private readonly canvas: HTMLCanvasElement

    private element: HTMLElement | null = null

    private html: string | null = null

    private size = { width: 0, height: 0 }

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
                last = { data, html: template.innerHTML.replace(PLACEHOLDER, (_, key: string) => escapeHtml(data[key])) }

            return last.html
        }
    }

    static fromText(text: string) {
        const style = `padding: ${ Tooltip.padding }px; border: ${ DEFAULT_LINE_WIDTH }px solid ${ Theme.dropdownBorder };
                       border-radius: ${ Tooltip.radius }px; background: ${ Theme.background }; color: ${ Theme.text };
                       font: ${ Tooltip.fontSize }px/${ Tooltip.rowHeight }px ${ FONT_FAMILY }; white-space: pre`

        return `<div style="${ style }">${ escapeHtml(text) }</div>`
    }

    show(html: string, point: Point) {
        if (html !== this.html || !this.element) {
            this.hide()

            this.element = this.build(html)
            this.html = html
        }

        this.place(this.element, point)
    }

    hide() {
        this.element?.remove()

        this.element = null
        this.html = null
    }

    private build(html: string) {
        const element = document.createElement(Tag.Div)

        element.innerHTML = html

        element.style.position = Styles.Position.Fixed
        element.style.left = '0'
        element.style.top = '0'
        element.style.pointerEvents = Styles.PointerEvents.None

        const host = this.canvas.closest(Tag.Dialog) ?? document.fullscreenElement ?? document.body

        host.appendChild(element)

        const { width, height } = element.getBoundingClientRect()

        this.size = { width, height }

        return element
    }

    private place(element: HTMLElement, point: Point) {
        const canvas = this.canvas.getBoundingClientRect()
        const { clientWidth, clientHeight } = document.documentElement

        const { x, y } = placeNear({ x: canvas.left + point.x, y: canvas.top + point.y }, this.size.width, this.size.height, Tooltip.offset,
            { x: 0, y: 0, width: clientWidth, height: clientHeight })

        element.style.left = `${ x }px`
        element.style.top = `${ y }px`
    }
}