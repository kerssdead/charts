import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import Frame from '@/types/Frame'
import Point from '@/types/Point'
import ButtonOptions, { fromDropdownItems } from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import HoverMap from '@/types/HoverMap'
import RectangleDimensions from '@/types/RectangleDimensions'
import FadingOverlay from '@/renderer/FadingOverlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { withAlpha } from '@/helpers/Color'
import { ContextMenu, Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { contains, copyRect, placeNear, sameRect, samePoint } from '@/helpers/Geometry'
import { maxOf, sum } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'

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
    menu: DropdownItem[] | undefined

    fixedButtons: (() => ButtonOptions[]) | undefined

    private readonly hover = new HoverMap<number>()

    private bounds: RectangleDimensions | null = null

    private buttonRects: (RenderItem | null)[] = []

    update({ queue, window, screen, mouse, context, now }: Frame): boolean {
        const point = context?.point ?? null
        const fixedButtons = context?.isMenu ? this.fixedButtons?.() : undefined
        const target = point && !fixedButtons ? queue.items.find(item => item.hasContextMenuAt(point)) : undefined

        const previous = this.state
        const isSame = previous != null && samePoint(previous.point, point)

        const targetButtons = !fixedButtons && !target
                              ? []
                              : isSame
                                ? previous.buttons
                                : fixedButtons ?? fromDropdownItems(this.menu, target?.data ?? undefined)

        const isVisible = point != null && targetButtons.length > 0

        if (isVisible && !isSame) {
            this.hover.clear()
            this.state = { point, buttons: targetButtons }
        }

        this.fade.step(isVisible, now, ContextMenu.fadeDuration)

        const alpha = this.fade.value

        if (!isVisible && alpha == 0) {
            this.state = null
            this.hover.clear()
        }

        if (!this.state) {
            this.bounds = null
            this.remove(queue)

            return false
        }

        const { point: menuPoint, buttons } = this.state
        const bounds = this.getBounds(screen, menuPoint, buttons)

        this.bounds = isVisible ? bounds : null

        if (alpha == 0) {
            this.remove(queue)

            return this.fade.isAnimating
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

        this.hover.clear()
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
        const targets = ContextMenuOverlay.getRows(bounds, buttons).flatMap((row, index): [number, boolean][] => {
            return row.isDivider || !this.buttonRects[index] ? [] : [[index, contains(row, mouse)]]
        })

        this.hover.update(targets, now)

        this.buttonRects.forEach((rect, index) => {
            if (rect)
                rect.color = ContextMenuOverlay.getButtonColor(this.hover.get(index))
        })

        return this.hover.isAnimating
    }

    private getBounds(screen: CanvasWindow, point: Point, buttons: ButtonOptions[]): RectangleDimensions {
        const width = Math.max(ContextMenu.minWidth,
            maxOf(buttons, button => stringWidth(button.text, ContextMenu.fontSize)) + ContextMenu.textPadding * 2 + ContextMenu.padding * 2)
        const height = sum(buttons, ContextMenuOverlay.getButtonHeight) + ContextMenu.padding * 2

        const { x, y } = placeNear(point, width, height, ContextMenu.offset, screen)

        return { x, y, width, height }
    }

    private build(items: QueueItemsBuilder,
                  window: CanvasWindow,
                  bounds: RectangleDimensions,
                  buttons: ButtonOptions[],
                  isInteractive: boolean) {
        const { x, width } = bounds

        const units = Units.fromWindow(window)

        this.buttonRects = []

        items.rect()
             .box(units, bounds)
             .fill()
             .round(units.x(ContextMenu.menuRadius))
             .color(Theme.contextMenuBackground)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.ContextMenu - 20)

        ContextMenuOverlay.getRows(bounds, buttons).forEach((button, index) => {
            if (button.isDivider) {
                const dividerY = button.y + button.height / 2

                items.line()
                     .stop(units.positionX(x + ContextMenu.padding), units.positionY(dividerY))
                     .stop(units.positionX(x + width - ContextMenu.padding), units.positionY(dividerY))
                     .color(Theme.dropdownBorder)
                     .layer(Layer.ContextMenu - 10)

                this.buttonRects.push(null)

                return
            }

            const rect = items.rect()
                              .box(units, button)
                              .round(units.x(ContextMenu.buttonRadius))
                              .fill()
                              .color(ContextMenuOverlay.getButtonColor(this.hover.get(index)))
                              .layer(Layer.ContextMenu - 10)

            if (isInteractive)
                rect.menuButton()
                    .onClick(buttons[index].action)

            this.buttonRects.push(rect.dispose())

            items.text(buttons[index].text)
                 .position(units.positionX(button.x + ContextMenu.textPadding), units.positionY(button.y + button.height / 2))
                 .size(ContextMenu.fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.ContextMenu)
        })
    }

    private static getButtonColor(hover: HoverProgress | undefined) {
        return !hover || hover.isIdle
               ? Theme.contextMenuButton
               : withAlpha(Theme.contextMenuButtonHover, hover.value)
    }

    private static getRows(bounds: RectangleDimensions, buttons: ButtonOptions[]): MenuRow[] {
        let y = bounds.y + ContextMenu.padding

        return buttons.map(button => {
            const height = ContextMenuOverlay.getButtonHeight(button)
            const row = { x: bounds.x + ContextMenu.padding, y, width: bounds.width - ContextMenu.padding * 2, height, isDivider: !!button.isDivider }

            y += height

            return row
        })
    }

    private static getButtonHeight(button: ButtonOptions) {
        return button.isDivider ? ContextMenu.dividerHeight : ContextMenu.buttonHeight
    }
}