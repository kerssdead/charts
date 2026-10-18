import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import ButtonOptions, { fromDropdownItems } from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import RectangleDimensions from '@/types/RectangleDimensions'
import FadingOverlay from '@/renderer/FadingOverlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { AnimationTiming, ContextMenu, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { contains, copyRect, maxOf, placeNear, sameRect, samePoint, stringWidth, sum } from '@/Helper'

type MenuState = {
    point: Point
    buttons: ButtonOptions[]
}

type BuildKey = {
    state: MenuState
    window: RectangleDimensions
    isInteractive: boolean
}

type MenuRow = RectangleDimensions & {
    isDivider: boolean
}

export default class ContextMenuOverlay extends FadingOverlay<MenuState, BuildKey> {
    private hover: HoverProgress[] = []

    private bounds: RectangleDimensions | null = null

    private buttonRects: (RenderItem | null)[] = []

    update(queue: Queue,
           window: CanvasWindow,
           point: Point | null,
           mouse: Point | null,
           isOpen: boolean,
           menu: DropdownItem[] | undefined,
           now: DOMHighResTimeStamp,
           fixedButtons?: ButtonOptions[]): boolean {
        let target: RenderItem | undefined

        if (isOpen && point && !fixedButtons)
            target = queue.items.find(item => item.hasContextMenuAt(point))

        const previous = this.state
        const isSame = previous != null && samePoint(previous.point, point)

        let targetButtons: ButtonOptions[] = []

        if (isOpen && fixedButtons)
            targetButtons = isSame ? previous.buttons : fixedButtons
        else if (target)
            targetButtons = isSame ? previous.buttons : fromDropdownItems(menu, target.data)

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

            this.show(queue, QueueItemsBuilder.build((builder: QueueItemsBuilder) => this.build(builder, window, bounds, buttons, isVisible)))

            this.built = {
                state: this.state,
                window: copyRect(window),
                isInteractive: isVisible
            }
        }

        this.setAlpha(alpha)

        const isHoverAnimating = isVisible && this.updateHover(bounds, buttons, mouse, now)

        return this.fade.isAnimating || isHoverAnimating
    }

    isOver(point: Point) {
        return !!this.bounds && contains(this.bounds, point)
    }

    clear(queue: Queue) {
        super.clear(queue)

        this.hover = []
        this.bounds = null
    }

    protected remove(queue: Queue) {
        super.remove(queue)

        this.buttonRects = []
    }

    private isBuilt(window: CanvasWindow, isInteractive: boolean) {
        const built = this.built

        return built != null
               && built.state === this.state
               && built.isInteractive == isInteractive
               && sameRect(built.window, window)
    }

    private updateHover(bounds: RectangleDimensions, buttons: ButtonOptions[], mouse: Point | null, now: DOMHighResTimeStamp) {
        let isAnimating = false

        ContextMenuOverlay.getRows(bounds, buttons).forEach((row, index) => {
            const rect = this.buttonRects[index]

            if (row.isDivider || !rect)
                return

            const hover = this.hover[index] ??= new HoverProgress()

            hover.step(contains(row, mouse), now, AnimationTiming.button)

            rect.color = ContextMenuOverlay.getButtonColor(hover)

            isAnimating ||= hover.isAnimating
        })

        return isAnimating
    }

    private getBounds(window: CanvasWindow, point: Point, buttons: ButtonOptions[]): RectangleDimensions {
        const { offset, padding, textPadding, fontSize, minWidth } = ContextMenu

        const width = Math.max(minWidth,
            maxOf(buttons, button => stringWidth(button.text, fontSize)) + textPadding * 2 + padding * 2)
        const height = sum(buttons, ContextMenuOverlay.getButtonHeight) + padding * 2

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
             .round(units.x(menuRadius))
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.contextMenuBackground)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.ContextMenu - 20)

        ContextMenuOverlay.getRows(bounds, buttons).forEach((button, index) => {
            if (button.isDivider) {
                const dividerY = button.y + button.height / 2

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
                              .round(units.x(buttonRadius))
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

    private static getRows(bounds: RectangleDimensions, buttons: ButtonOptions[]): MenuRow[] {
        const { padding } = ContextMenu

        let y = bounds.y + padding

        return buttons.map(button => {
            const height = ContextMenuOverlay.getButtonHeight(button)
            const row = { x: bounds.x + padding, y, width: bounds.width - padding * 2, height, isDivider: !!button.isDivider }

            y += height

            return row
        })
    }

    private static getButtonHeight(button: ButtonOptions) {
        return button.isDivider ? ContextMenu.dividerHeight : ContextMenu.buttonHeight
    }
}