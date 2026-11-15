import FloatingElement from '@/renderer/FloatingElement'
import ButtonOptions from '@/types/ButtonOptions'
import Point from '@/types/Point'
import { ThemePalette } from '@/Theme'
import { ContextMenu, UI_FONT_FAMILY } from '@/static/constants/Index'
import { Events } from '@/static/Enums'
import { appearScale } from '@/animation/Animations'
import { FLOATING_PANEL_BLUR, floatingPanelShadow } from '@/helpers/FloatingStyle'

export type MenuPopupOptions = {
    options: ButtonOptions[]
    theme: ThemePalette
    select: (action: () => void) => void
    dismiss: () => void
}

const HIGHLIGHT_TRANSITION = 'background-color .15s ease'

export default class MenuPopup {
    private readonly floating: FloatingElement

    private readonly buttons: HTMLButtonElement[] = []

    private readonly hovered = new Set<HTMLButtonElement>()

    private readonly theme: ThemePalette

    private previousFocus: Element | null = null

    private isInteractive = true

    private isHighlightVisible = false

    constructor(canvas: HTMLCanvasElement, { options, theme, select, dismiss }: MenuPopupOptions) {
        this.theme = theme
        this.floating = new FloatingElement(canvas, ContextMenu.offset)

        this.floating.minWidth = ContextMenu.minWidth

        const { element } = this.floating

        element.setAttribute('role', 'menu')
        Object.assign(element.style, {
            padding: `${ ContextMenu.padding }px`,
            border: `1px solid ${ theme.dropdownBorder }`,
            borderRadius: `${ ContextMenu.menuRadius }px`,
            background: theme.floatingBackground,
            color: theme.text,
            font: `${ ContextMenu.fontSize }px ${ UI_FONT_FAMILY }`,
            overscrollBehavior: 'contain',
            userSelect: 'none',
            transformOrigin: 'center',
            boxShadow: floatingPanelShadow(theme.isDark)
        })
        element.style.backdropFilter = FLOATING_PANEL_BLUR
        element.style.setProperty('-webkit-backdrop-filter', FLOATING_PANEL_BLUR)

        for (const option of options)
            element.appendChild(option.isDivider ? this.divider() : this.button(option, select))

        element.addEventListener(Events.KeyDown, event => this.onKey(event, dismiss))
        element.addEventListener(Events.ContextMenu, event => event.preventDefault())
    }

    show(point: Point) {
        const isNew = !this.floating.element.isConnected

        if (isNew) {
            this.previousFocus = document.activeElement
            this.isHighlightVisible = false
            this.refreshHighlights(null)
        }

        this.floating.show(point)

        if (isNew)
            this.buttons[0]?.focus({ preventScroll: true })
    }

    update(alpha: number, isInteractive: boolean) {
        const element = this.floating.element

        element.style.opacity = String(alpha)
        element.style.transform = `scale(${ appearScale(alpha) })`
        element.style.pointerEvents = isInteractive ? 'auto' : 'none'

        if (this.isInteractive === isInteractive)
            return

        this.isInteractive = isInteractive

        if (!isInteractive)
            this.restoreFocus()

        for (const button of this.buttons)
            button.disabled = !isInteractive
    }

    remove() {
        this.restoreFocus()
        this.floating.remove()
    }

    private restoreFocus() {
        if (this.floating.element.contains(document.activeElement)
            && this.previousFocus instanceof HTMLElement && this.previousFocus.isConnected)
            this.previousFocus.focus({ preventScroll: true })
    }

    private divider() {
        const divider = document.createElement('div')

        divider.setAttribute('role', 'separator')
        Object.assign(divider.style, {
            height: '1px',
            margin: `${ (ContextMenu.dividerHeight - 1) / 2 }px 0`,
            background: this.theme.dropdownBorder
        })

        return divider
    }

    private button(option: ButtonOptions, select: (action: () => void) => void) {
        const button = document.createElement('button')

        button.type = 'button'
        button.setAttribute('role', 'menuitem')
        button.tabIndex = -1
        button.textContent = option.text
        Object.assign(button.style, {
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            height: 'auto',
            minHeight: `${ ContextMenu.buttonHeight }px`,
            padding: `4px ${ ContextMenu.textPadding }px`,
            border: '0',
            borderRadius: `${ ContextMenu.buttonRadius }px`,
            background: this.theme.contextMenuButton,
            boxShadow: 'none',
            backdropFilter: 'none',
            color: 'inherit',
            font: 'inherit',
            textAlign: 'start',
            overflowWrap: 'anywhere',
            cursor: 'pointer',
            outline: 'none',
            transition: HIGHLIGHT_TRANSITION
        })
        button.style.setProperty('-webkit-backdrop-filter', 'none')

        button.addEventListener(Events.PointerEnter, () => {
            this.hovered.add(button)
            this.refreshHighlights(document.activeElement)
        })
        button.addEventListener(Events.PointerLeave, () => {
            this.hovered.delete(button)
            this.refreshHighlights(document.activeElement)
        })
        button.addEventListener(Events.Focus, () => this.refreshHighlights(document.activeElement))
        button.addEventListener(Events.Blur, () => this.refreshHighlights(document.activeElement))
        button.addEventListener(Events.Click, () => {
            if (this.isInteractive)
                select(option.action)
        })
        this.buttons.push(button)

        return button
    }

    private refreshHighlights(selected: Element | null) {
        for (const button of this.buttons) {
            const isSelected = this.isHighlightVisible && button === selected

            this.applyHighlight(button, this.hovered.has(button), isSelected)
        }
    }

    private applyHighlight(button: HTMLButtonElement, isHovered: boolean, isSelected: boolean) {
        if (isSelected) {
            button.style.background = this.theme.text
            button.style.color = this.theme.background

            return
        }

        button.style.background = isHovered ? this.theme.contextMenuButtonHover : this.theme.contextMenuButton
        button.style.color = 'inherit'
    }

    private isActivationKey(event: KeyboardEvent) {
        return event.key === 'Enter' || event.key === ' '
    }

    private onKey(event: KeyboardEvent, dismiss: () => void) {
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape')
                event.preventDefault()

            event.stopPropagation()
            dismiss()

            return
        }

        if (this.isActivationKey(event)) {
            this.isHighlightVisible = true
            this.refreshHighlights(document.activeElement)

            return
        }

        const index = this.buttons.findIndex(button => button === document.activeElement)
        const last = this.buttons.length - 1
        const next = {
            ArrowDown: index === last ? 0 : index + 1,
            ArrowUp: index <= 0 ? last : index - 1,
            Home: 0,
            End: last
        }[event.key]

        if (next !== undefined) {
            event.preventDefault()
            this.isHighlightVisible = true
            this.buttons[next]?.focus()
            this.refreshHighlights(this.buttons[next] ?? null)
        }
    }
}