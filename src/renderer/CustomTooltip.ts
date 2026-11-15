import Point from '@/types/Point'
import { DEFAULT_LINE_WIDTH, Tooltip, UI_FONT_FAMILY } from '@/static/constants/Index'
import { ThemePalette } from '@/Theme'
import { escapeHtml } from '@/helpers/Text'
import FloatingElement from '@/renderer/FloatingElement'
import { appearScale } from '@/animation/Animations'
import { FLOATING_PANEL_BLUR, floatingPanelShadow } from '@/helpers/FloatingStyle'
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

    static fromText(text: string, theme: ThemePalette) {
        const style = `padding: ${ Tooltip.padding }px;
                       border: ${ DEFAULT_LINE_WIDTH }px solid ${ theme.dropdownBorder };
                       border-radius: ${ Tooltip.radius }px;
                       background: ${ theme.floatingBackground };
                       box-shadow: ${ floatingPanelShadow(theme.isDark) };
                       backdrop-filter: ${ FLOATING_PANEL_BLUR };
                       -webkit-backdrop-filter: ${ FLOATING_PANEL_BLUR };
                       color: ${ theme.text };
                       font: ${ Tooltip.fontSize }px/${ Tooltip.rowHeight }px ${ UI_FONT_FAMILY };
                       box-sizing: border-box;
                       user-select: none;
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
            this.floating.element.style.transformOrigin = 'center'
            this.floating.element.innerHTML = html
            this.html = html
        }

        this.floating.show(point)
    }

    setAppearProgress(progress: number) {
        if (!this.floating)
            return

        this.floating.element.style.opacity = String(progress)
        this.floating.element.style.transform = `scale(${ appearScale(progress) })`
    }

    hide() {
        this.floating?.remove()
        this.floating = null
        this.html = null
    }
}