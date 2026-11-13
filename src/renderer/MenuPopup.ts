import FloatingElement from '@/renderer/FloatingElement'
import ButtonOptions from '@/types/ButtonOptions'
import Point from '@/types/Point'
import Theme from '@/Theme'
import { ContextMenu, FONT_FAMILY } from '@/static/constants/Index'
import { Events } from '@/static/Enums'

export default class MenuPopup {
    private readonly floating: FloatingElement

    private readonly buttons: HTMLButtonElement[] = []

    private previousFocus: Element | null = null

    private isInteractive = true

    constructor(
        canvas: HTMLCanvasElement,
        options: ButtonOptions[],
        select: (action: () => void) => void,
        dismiss: () => void
    ) {
        this.floating = new FloatingElement(canvas, ContextMenu.offset)

        this.floating.minWidth = ContextMenu.minWidth

        const { element } = this.floating

        element.setAttribute('role', 'menu')
        Object.assign(element.style, {
            padding: `${ ContextMenu.padding }px`,
            border: `1px solid ${ Theme.dropdownBorder }`,
            borderRadius: `${ ContextMenu.menuRadius }px`,
            background: Theme.contextMenuBackground,
            color: Theme.text,
            font: `${ ContextMenu.fontSize }px ${ FONT_FAMILY }`,
            overscrollBehavior: 'contain'
        })

        for (const option of options)
            element.appendChild(option.isDivider ? this.divider() : this.button(option, select))

        element.addEventListener(Events.KeyDown, event => this.onKey(event, dismiss))
        element.addEventListener(Events.ContextMenu, event => event.preventDefault())
    }

    show(point: Point) {
        const isNew = !this.floating.element.isConnected

        if (isNew)
            this.previousFocus = document.activeElement

        this.floating.show(point)

        if (isNew)
            this.buttons[0]?.focus({ preventScroll: true })
    }

    update(alpha: number, isInteractive: boolean) {
        this.floating.element.style.opacity = String(alpha)
        this.floating.element.style.pointerEvents = isInteractive ? 'auto' : 'none'

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
            background: Theme.dropdownBorder
        })

        return divider
    }

    private button(option: ButtonOptions, select: (action: () => void) => void) {
        const button = document.createElement('button')
        const hoverColor = Theme.contextMenuButtonHover
        const focusColor = Theme.text

        button.type = 'button'
        button.setAttribute('role', 'menuitem')
        button.tabIndex = -1
        button.textContent = option.text
        Object.assign(button.style, {
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            minHeight: `${ ContextMenu.buttonHeight }px`,
            padding: `2px ${ ContextMenu.textPadding }px`,
            border: '0',
            borderRadius: `${ ContextMenu.buttonRadius }px`,
            background: 'transparent',
            color: 'inherit',
            font: 'inherit',
            textAlign: 'start',
            overflowWrap: 'anywhere',
            cursor: 'pointer',
            outlineOffset: '-2px'
        })

        button.addEventListener(Events.PointerEnter, () => button.style.background = hoverColor)
        button.addEventListener(Events.PointerLeave, () => button.style.background = 'transparent')
        button.addEventListener(Events.Focus, () => button.style.outline = `2px solid ${ focusColor }`)
        button.addEventListener(Events.Blur, () => button.style.outline = '')
        button.addEventListener(Events.Click, () => {
            if (this.isInteractive)
                select(option.action)
        })
        this.buttons.push(button)

        return button
    }

    private onKey(event: KeyboardEvent, dismiss: () => void) {
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape')
                event.preventDefault()

            event.stopPropagation()
            dismiss()

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
            this.buttons[next]?.focus()
        }
    }
}