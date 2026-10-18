import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import ButtonOptions from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import RectangleDimensions from '@/types/RectangleDimensions'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { AnimationTiming, ContextMenu, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { contains, placeNear, stringWidth } from '@/Helper'

type BuildKey = {
    state: ContextMenuOverlay['state']
    window: Pick<CanvasWindow, 'x' | 'y' | 'width' | 'height'>
    isInteractive: boolean
}

export default class ContextMenuOverlay extends Overlay {
    private state: { point: Point, buttons: ButtonOptions[] } | null = null

    private fade = new HoverProgress()

    private hover: HoverProgress[] = []

    private bounds: RectangleDimensions | null = null

    private buttonRects: (RenderItem | null)[] = []

    private built: BuildKey | null = null

    update(queue: Queue,
           window: CanvasWindow,
           point: Point | null,
           mouse: Point | null,
           isOpen: boolean,
           menu: DropdownItem[] | undefined,
           now: DOMHighResTimeStamp,
           fixedButtons?: ButtonOptions[]): boolean {
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

        this.fade.step(isVisible, now, ContextMenu.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha == 0) {
            this.state = null
            this.hover = []
        }

        if (!this.state) {
            this.bounds = null
            this.remove(queue)

            return false
        }

        const { point: menuPoint, buttons } = this.state
        const bounds = this.getBounds(window, menuPoint, buttons)

        this.bounds = isVisible ? bounds : null

        if (alpha == 0) {
            this.remove(queue)

            return false
        }

        if (!this.isBuilt(window, isVisible)) {
            this.remove(queue)

            this.show(queue, QueueItemsBuilder.build([
                (builder: QueueItemsBuilder) => this.build(builder, window, bounds, buttons, isVisible)
            ]))

            this.built = {
                state: this.state,
                window: { x: window.x, y: window.y, width: window.width, height: window.height },
                isInteractive: isVisible
            }
        }

        for (const item of this.items) {
            item.animation.alpha = alpha
        }

        const isHoverAnimating = isVisible && this.updateHover(bounds, buttons, mouse, now)

        return this.fade.isAnimating || isHoverAnimating
    }

    isOver(point: Point) {
        return !!this.bounds && contains(this.bounds, point)
    }

    clear(queue: Queue) {
        this.remove(queue)

        this.state = null
        this.fade = new HoverProgress()
        this.hover = []
        this.bounds = null
    }

    protected remove(queue: Queue) {
        super.remove(queue)

        this.buttonRects = []
        this.built = null
    }

    private isBuilt(window: CanvasWindow, isInteractive: boolean) {
        const built = this.built

        return built != null
               && built.state === this.state
               && built.isInteractive == isInteractive
               && built.window.x == window.x && built.window.y == window.y
               && built.window.width == window.width && built.window.height == window.height
    }

    private updateHover(bounds: RectangleDimensions, buttons: ButtonOptions[], mouse: Point | null, now: DOMHighResTimeStamp) {
        let isAnimating = false

        ContextMenuOverlay.getButtonBounds(bounds, buttons).forEach((button, index) => {
            const rect = this.buttonRects[index]

            if (!button || !rect)
                return

            const hover = this.hover[index] ??= new HoverProgress()

            hover.step(contains(button, mouse), now, AnimationTiming.button)

            rect.color = rect.activeColor = ContextMenuOverlay.getButtonColor(hover)

            isAnimating ||= hover.isAnimating
        })

        return isAnimating
    }

    private getBounds(window: CanvasWindow, point: Point, buttons: ButtonOptions[]): RectangleDimensions {
        const { offset, padding, textPadding, fontSize, minWidth } = ContextMenu

        const width = Math.max(minWidth,
            Math.max(...buttons.map(button => stringWidth(button.text, fontSize))) + textPadding * 2 + padding * 2)
        const height = buttons.reduce((acc, button) => acc + ContextMenuOverlay.getButtonHeight(button), 0) + padding * 2

        const { x, y } = placeNear(point, width, height, offset, window)

        return { x, y, width, height }
    }

    private build(items: QueueItemsBuilder,
                  window: CanvasWindow,
                  bounds: RectangleDimensions,
                  buttons: ButtonOptions[],
                  isInteractive: boolean) {
        const {
            padding,
            textPadding,
            fontSize,
            menuRadius,
            buttonRadius
        } = ContextMenu

        const { x, y, width, height } = bounds

        const units = Units.fromWindow(window)

        this.hover.length = buttons.length
        this.buttonRects = []

        items.rect()
             .position(units.positionX(x), units.positionY(y))
             .size(units.x(width), units.y(height))
             .fill()
             .round(Array(4).fill(units.x(menuRadius)))
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.contextMenuBackground)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.ContextMenu - 20)

        ContextMenuOverlay.getButtonBounds(bounds, buttons).forEach((button, index) => {
            if (!button) {
                const dividerY = ContextMenuOverlay.getButtonTop(bounds, buttons, index) + ContextMenu.dividerHeight / 2

                items.line()
                     .stop(units.positionX(x + padding), units.positionY(dividerY))
                     .stop(units.positionX(x + width - padding), units.positionY(dividerY))
                     .color(Theme.dropdownBorder)
                     .layer(Layer.ContextMenu - 10)

                this.buttonRects.push(null)

                return
            }

            const rect = items.rect()
                              .position(units.positionX(button.x), units.positionY(button.y))
                              .size(units.x(button.width), units.y(button.height))
                              .round(Array(4).fill(units.x(buttonRadius)))
                              .fill()
                              .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                              .color(ContextMenuOverlay.getButtonColor(this.hover[index]))
                              .layer(Layer.ContextMenu - 10)

            if (isInteractive)
                rect.contextMenuButton()
                    .onClick(buttons[index].action)

            this.buttonRects.push(rect.dispose())

            items.text(buttons[index].text)
                 .position(units.positionX(button.x + textPadding), units.positionY(button.y + button.height / 2))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.ContextMenu)
        })
    }

    private static getButtonColor(hover: HoverProgress | undefined) {
        return !hover || hover.isIdle
               ? Theme.contextMenuButton
               : Theme.withAlpha(Theme.contextMenuButtonHover, hover.value)
    }

    private static getButtonTop(bounds: RectangleDimensions, buttons: ButtonOptions[], index: number) {
        return bounds.y + ContextMenu.padding
               + buttons.slice(0, index).reduce((acc, button) => acc + ContextMenuOverlay.getButtonHeight(button), 0)
    }

    private static getButtonBounds(bounds: RectangleDimensions, buttons: ButtonOptions[]): (RectangleDimensions | null)[] {
        const { padding, buttonHeight } = ContextMenu

        let y = bounds.y + padding

        return buttons.map(button => {
            const top = y

            y += ContextMenuOverlay.getButtonHeight(button)

            return button.isDivider
                   ? null
                   : { x: bounds.x + padding, y: top, width: bounds.width - padding * 2, height: buttonHeight }
        })
    }

    private static getButtonHeight(button: ButtonOptions) {
        return button.isDivider ? ContextMenu.dividerHeight : ContextMenu.buttonHeight
    }
}