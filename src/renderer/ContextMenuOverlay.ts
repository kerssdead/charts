import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import ButtonOptions from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import Theme from '@/Theme'
import { AnimationTiming, ContextMenu, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { placeNear, stringWidth } from '@/Helper'

type BuildKey = {
    state: ContextMenuOverlay['state']
    window: Pick<CanvasWindow, 'x' | 'y' | 'width' | 'height'>
    mouse: Point | null
}

type Bounds = {
    left: number
    top: number
    width: number
    height: number
}

export default class ContextMenuOverlay {
    private state: { point: Point, buttons: ButtonOptions[] } | null = null

    private fade = new HoverProgress()

    private hover: HoverProgress[] = []

    private bounds: Bounds | null = null

    private items: Set<RenderItem> = new Set()

    private built: BuildKey | null = null

    private isButtonHovered: boolean = false

    update(queue: Queue,
           window: CanvasWindow,
           point: Point | null,
           mouse: Point | null,
           isOpen: boolean,
           menu: DropdownItem[] | undefined,
           fixedButtons?: ButtonOptions[]) {
        let target: RenderItem | undefined

        if (isOpen && point && !fixedButtons) {
            for (const item of queue.items) {
                item.contextMenu(point)
            }

            target = queue.items.find(item => item.hasContextMenu && item.showContextMenu)
        }

        const previous = this.state
        const isSame = previous != null && previous.point.x === point?.x && previous.point.y === point?.y

        const targetButtons = isOpen && fixedButtons
                              ? isSame ? previous.buttons : fixedButtons
                              : !target ? [] : isSame ? previous.buttons : ButtonOptions.fromItems(menu, target.data)

        const isVisible = point != null && targetButtons.length > 0

        if (isVisible && !isSame) {
            this.hover = []
            this.state = { point, buttons: targetButtons }
        }

        this.fade.step(isVisible, performance.now(), ContextMenu.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha == 0) {
            this.state = null
            this.hover = []
        }

        if (!this.state) {
            this.bounds = null
            this.remove(queue)

            return
        }

        const { point: menuPoint, buttons } = this.state
        const bounds = this.getBounds(window, menuPoint, buttons)

        this.bounds = isVisible ? bounds : null

        if (alpha == 0) {
            this.remove(queue)

            return
        }

        const activeMouse = isVisible ? mouse : null

        if (!this.isBuilt(window, activeMouse)) {
            this.remove(queue)

            const items = QueueItemsBuilder.build([
                (builder: QueueItemsBuilder) => this.build(builder, window, bounds, buttons, activeMouse, isVisible)
            ])

            queue.add(items)

            this.items = new Set(items)
            this.built = {
                state: this.state,
                window: { x: window.x, y: window.y, width: window.width, height: window.height },
                mouse: activeMouse
            }
        }

        for (const item of this.items) {
            item.animation.alpha = alpha
        }
    }

    isOver(point: Point) {
        const bounds = this.bounds

        return !!bounds
               && bounds.left <= point.x && point.x <= bounds.left + bounds.width
               && bounds.top <= point.y && point.y <= bounds.top + bounds.height
    }

    clear(queue: Queue) {
        this.remove(queue)

        this.state = null
        this.fade = new HoverProgress()
        this.hover = []
        this.bounds = null
    }

    private isBuilt(window: CanvasWindow, mouse: Point | null) {
        const built = this.built

        if (built == null || built.state !== this.state || this.isButtonHovered)
            return false

        if (built.window.x != window.x || built.window.y != window.y
            || built.window.width != window.width || built.window.height != window.height)
            return false

        if (built.mouse?.x !== mouse?.x || built.mouse?.y !== mouse?.y)
            return false

        for (const hover of this.hover)
            if (hover && !hover.isIdle)
                return false

        return true
    }

    private remove(queue: Queue) {
        queue.remove(this.items)

        this.items.clear()
        this.built = null
    }

    private getBounds(window: CanvasWindow, point: Point, buttons: ButtonOptions[]): Bounds {
        const { offset, padding, textPadding, fontSize, minWidth } = ContextMenu

        const width = Math.max(minWidth,
            Math.max(...buttons.map(button => stringWidth(button.text, fontSize))) + textPadding * 2 + padding * 2)
        const height = buttons.reduce((acc, button) => acc + ContextMenuOverlay.getButtonHeight(button), 0) + padding * 2

        const { x: left, y: top } = placeNear(point, width, height, offset, window)

        return { left, top, width, height }
    }

    private build(items: QueueItemsBuilder,
                  window: CanvasWindow,
                  bounds: Bounds,
                  buttons: ButtonOptions[],
                  mouse: Point | null,
                  isInteractive: boolean) {
        const {
            padding,
            buttonHeight,
            textPadding,
            fontSize,
            menuRadius,
            buttonRadius
        } = ContextMenu

        const { left, top, width, height } = bounds

        const toX = (x: number) => RenderItem.reAdjustX(window, x)
        const toY = (y: number) => RenderItem.reAdjustY(window, y)
        const toWidth = (width: number) => RenderItem.reAdjustWidth(window, width)
        const toHeight = (height: number) => RenderItem.reAdjustHeight(window, height)

        const now = performance.now()

        this.hover.length = buttons.length
        this.isButtonHovered = false

        items.rect()
             .position(toX(left), toY(top))
             .size(toWidth(width), toHeight(height))
             .fill()
             .round(Array(4).fill(toWidth(menuRadius)))
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.contextMenuBackground)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.ContextMenu - 20)

        let y = top + padding

        buttons.forEach((button, index) => {
            const x = left + padding
            const buttonWidth = width - padding * 2

            if (button.isDivider) {
                items.line()
                     .stop(toX(x), toY(y + ContextMenu.dividerHeight / 2))
                     .stop(toX(x + buttonWidth), toY(y + ContextMenu.dividerHeight / 2))
                     .color(Theme.dropdownBorder)
                     .layer(Layer.ContextMenu - 10)

                y += ContextMenu.dividerHeight

                return
            }

            const isOver = !!mouse
                           && x <= mouse.x && mouse.x <= x + buttonWidth
                           && y <= mouse.y && mouse.y <= y + buttonHeight

            this.isButtonHovered ||= isOver

            const hover = this.hover[index] ??= new HoverProgress()

            if (isInteractive)
                hover.step(isOver, now, AnimationTiming.button)

            const color = hover.isIdle
                          ? Theme.contextMenuButton
                          : Theme.withAlpha(Theme.contextMenuButtonHover, hover.value)

            const rect = items.rect()
                              .position(toX(x), toY(y))
                              .size(toWidth(buttonWidth), toHeight(buttonHeight))
                              .round(Array(4).fill(toWidth(buttonRadius)))
                              .fill()
                              .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                              .color(color)
                              .layer(Layer.ContextMenu - 10)

            if (isInteractive)
                rect.contextMenuButton()
                    .onClick(button.action)

            items.text(button.text)
                 .position(toX(x + textPadding + fontSize / 2), toY(y + buttonHeight / 2))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.ContextMenu)

            y += buttonHeight
        })
    }

    private static getButtonHeight(button: ButtonOptions) {
        return button.isDivider ? ContextMenu.dividerHeight : ContextMenu.buttonHeight
    }
}