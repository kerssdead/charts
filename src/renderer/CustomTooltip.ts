import Point from '@/types/Point'
import { DEFAULT_LINE_WIDTH, Tooltip } from '@/static/constants/Index'
import { getFontFamily } from '@/static/Typography'
import { ThemePalette } from '@/Theme'
import { escapeHtml } from '@/helpers/Text'
import FloatingElement from '@/renderer/FloatingElement'
import { appearScale } from '@/animation/Animations'
import { floatingPanelHighlight } from '@/helpers/FloatingStyle'
import ItemData from '@/types/ItemData'

const PLACEHOLDER = /\$\{\s*([^}\s]+)\s*}/g

const TEXT_STYLES = new WeakMap<ThemePalette, string>()

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
        let style = TEXT_STYLES.get(theme)

        if (style === undefined) {
            style = `padding: ${ Tooltip.padding }px;
                       border: ${ DEFAULT_LINE_WIDTH }px solid ${ theme.dropdownBorder };
                       border-radius: ${ Tooltip.radius }px;
                       background: ${ theme.background };
                       box-shadow: ${ floatingPanelHighlight(theme.isDark) };
                       color: ${ theme.text };
                       font: ${ Tooltip.fontSize }px/${ Tooltip.rowHeight }px ${ getFontFamily() };
                       box-sizing: border-box;
                       user-select: none;
                       white-space: pre-wrap;
                       overflow-wrap: anywhere`

            TEXT_STYLES.set(theme, style)
        }

        return `<div style="${ style }">${ escapeHtml(text) }</div>`
    }

    show(html: string, point: Point) {
        if (!this.floating) {
            const floating = new FloatingElement(this.canvas, Tooltip.offset)

            floating.element.setAttribute('role', 'tooltip')
            floating.element.style.pointerEvents = 'none'
            floating.element.style.transformOrigin = 'center'

            this.floating = floating
            this.html = null
        }

        if (html !== this.html) {
            this.floating.setHtml(html)
            this.html = html
        }

        this.floating.show(point)
    }

    setAppearProgress(progress: number) {
        if (!this.floating)
            return

        const { style } = this.floating.element
        const opacity = String(progress)
        const transform = `scale(${ appearScale(progress) })`

        if (style.opacity !== opacity)
            style.opacity = opacity

        if (style.transform !== transform)
            style.transform = transform
    }

    hide() {
        this.floating?.remove()
        this.floating = null
        this.html = null
    }
}