import Point from '@/types/Point'
import Styles from '@/static/constants/Styles'
import { Tag } from '@/static/Enums'
import { Tooltip } from '@/static/constants/Index'
import { escapeHtml } from '@/helpers/Text'
import { placeNear } from '@/helpers/Geometry'
import ItemData from '@/types/ItemData'

const PLACEHOLDER = /\$\{\s*([^}\s]+)\s*}/g

export default class CustomTooltip {
    private readonly canvas: HTMLCanvasElement

    private readonly template: HTMLTemplateElement

    private element: HTMLElement | null = null

    private data: ItemData | null = null

    private size = { width: 0, height: 0 }

    private constructor(canvas: HTMLCanvasElement, template: HTMLTemplateElement) {
        this.canvas = canvas
        this.template = template
    }

    static create(canvas: HTMLCanvasElement, templateId: string): CustomTooltip | null {
        const template = document.getElementById(templateId)

        return template instanceof HTMLTemplateElement
               ? new CustomTooltip(canvas, template)
               : null
    }

    show(data: ItemData, point: Point) {
        if (data !== this.data || !this.element) {
            this.hide()

            this.element = this.build(data)
            this.data = data
        }

        this.place(this.element, point)
    }

    hide() {
        this.element?.remove()

        this.element = null
        this.data = null
    }

    private build(data: ItemData) {
        const element = document.createElement(Tag.Div)

        element.innerHTML = this.template.innerHTML.replace(PLACEHOLDER, (_, key: string) => {
            return escapeHtml(data[key])
        })

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