import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import RenderItem from 'types/RenderItem'
import CanvasWindow from 'types/CanvasWindow'
import Point from 'types/Point'
import ButtonOptions from 'types/ButtonOptions'
import Theme from 'Theme'
import { Animations, ContextMenu, Layer, Tooltip } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from 'static/Enums'
import { placeNear, stringWidth } from 'Helper'
import CustomTooltip from 'renderer/CustomTooltip'
import HoverProgress from 'types/HoverProgress'
import ItemData from 'types/ItemData'
import DropdownItem from 'types/DropdownItem'

type Bounds = {
    left: number
    top: number
    width: number
    height: number
}

const OUTSIDE: Point = { x: -Infinity, y: -Infinity }

export default class Queue {
    queue: RenderItem[]

    ctx: CanvasRenderingContext2D

    private tooltipState: { point: Point, template: string } | null = null

    private tooltipFade = new HoverProgress()

    private contextMenuState: { point: Point, buttons: ButtonOptions[] } | null = null

    private contextMenuFade = new HoverProgress()

    private contextMenuHover: HoverProgress[] = []

    private contextMenuBounds: Bounds | null = null

    private isSorted: boolean = true

    constructor(ctx: CanvasRenderingContext2D) {
        this.queue = []
        this.ctx = ctx
    }

    render(window: CanvasWindow, screen: CanvasWindow = window): boolean {
        this.ctx.fillStyle = Theme.canvasBackground
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

        let isAnimating = false

        for (const step of this.getSorted()) {
            this.ctx.save()
            this.ctx.beginPath()

            this.ctx.globalAlpha = step.animation.alpha

            if (step.text && !step.color) {
                this.ctx.fillStyle = Theme.text
            }

            step.render(this.ctx, step.isFixed ? screen : window)

            this.ctx.restore()

            if (!step.isTemp && (step.animation.isInitializing || step.animation.isMorphing)) {
                isAnimating = true
            }
        }

        this.queue = this.queue.filter(item => !item.isTemp)

        for (let step of this.queue.filter(item => item.isContextMenu)) {
            step.isTemp = true
        }

        return isAnimating
    }

    animate(point: Point | null) {
        if (!point || this.isOverContextMenu(point)) {
            point = OUTSIDE
        }

        const hoveredGroups = new Set<string>()

        for (const item of this.queue) {
            if (item.hoverGroup != null && item.isAnimate && !item.isInitializing && item.in(point))
                hoveredGroups.add(item.hoverGroup)
        }

        for (const item of this.queue) {
            item.animate(point, hoveredGroups)
        }
    }

    tooltip(window: CanvasWindow, point: Point | null, isContextMenuOpen: boolean, custom: CustomTooltip | null) {
        let template: string | null = null
        let data: ItemData | null = null

        if (point && !isContextMenuOpen) {
            for (const item of this.queue) {
                item.tooltip(point)

                if (template == null && item.showTooltip) {
                    template = item.tooltipTemplate
                    data = item.data
                }
            }
        }

        if (custom && point && data)
            custom.show(data, point)
        else
            custom?.hide()

        const isVisible = !(custom && data) && point != null && template != null

        if (isVisible) {
            this.tooltipState = { point: point as Point, template: template as string }
        } else if (this.tooltipState && point) {
            this.tooltipState.point = point
        }

        const alpha = this.fade(this.tooltipFade, isVisible, Tooltip.fadeDuration)

        if (!isVisible && alpha == 0) {
            this.tooltipState = null
        }

        if (!this.tooltipState || alpha == 0) {
            return
        }

        const state = this.tooltipState

        const tooltipItems = this.add((items: QueueItemsBuilder) => {
            this.buildTooltip(items, window, state.point, state.template)
        })

        for (const item of tooltipItems) {
            item.animation.alpha = alpha
        }
    }

    contextMenu(window: CanvasWindow,
                point: Point | null,
                mouse: Point | null,
                isOpen: boolean,
                menu: DropdownItem[] | undefined) {
        this.queue = this.queue.filter(item => !item.isContextMenu)

        let target: RenderItem | undefined

        if (isOpen && point) {
            for (const item of this.queue) {
                item.contextMenu(point)
            }

            target = this.queue.find(item => item.hasContextMenu && item.showContextMenu)
        }

        const previous = this.contextMenuState
        const isSame = previous != null && previous.point.x === point?.x && previous.point.y === point?.y

        const targetButtons = !target ? [] : isSame ? previous.buttons : ButtonOptions.fromItems(menu, target.data)

        const isVisible = point != null && targetButtons.length > 0

        if (isVisible && !isSame) {
            this.contextMenuHover = []
            this.contextMenuState = { point, buttons: targetButtons }
        }

        const alpha = this.fade(this.contextMenuFade, isVisible, ContextMenu.fadeDuration)

        if (!isVisible && alpha == 0) {
            this.contextMenuState = null
            this.contextMenuHover = []
        }

        if (!this.contextMenuState) {
            this.contextMenuBounds = null

            return
        }

        const { point: menuPoint, buttons } = this.contextMenuState
        const bounds = this.getContextMenuBounds(window, menuPoint, buttons)

        this.contextMenuBounds = isVisible ? bounds : null

        if (alpha == 0) {
            return
        }

        const menuItems = this.add((items: QueueItemsBuilder) => {
            this.buildContextMenu(items, window, bounds, buttons, isVisible ? mouse : null, isVisible)
        })

        for (const item of menuItems) {
            item.animation.alpha = alpha
        }
    }

    private buildTooltip(items: QueueItemsBuilder, window: CanvasWindow, point: Point, template: string) {
        const { offset, padding, rowHeight, fontSize, radius } = Tooltip
        const { width: canvasWidth, height: canvasHeight } = this.ctx.canvas

        const rows = template.split('\n')

        const width = Math.max(...rows.map(row => stringWidth(row, fontSize))) + padding * 2
        const height = rows.length * rowHeight + padding * 2

        const { x: left, y: top } = placeNear(point, width, height, offset,
            { x: 0, y: 0, width: canvasWidth, height: canvasHeight })

        const toX = (x: number) => RenderItem.reAdjustX(window, x)
        const toY = (y: number) => RenderItem.reAdjustY(window, y)

        items.rect()
             .position(toX(left), toY(top))
             .size(RenderItem.reAdjustWidth(window, width), RenderItem.reAdjustHeight(window, height))
             .fill()
             .round([radius, radius, radius, radius])
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.background)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.Tooltip)
             .temp()

        rows.forEach((row, index) => {
            items.text(row)
                 .position(toX(left + padding + fontSize / 2), toY(top + padding + (index + .5) * rowHeight))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.Tooltip)
                 .temp()
        })
    }

    private getContextMenuBounds(window: CanvasWindow, point: Point, buttons: ButtonOptions[]): Bounds {
        const { offset, padding, buttonHeight, textPadding, fontSize, minWidth } = ContextMenu

        const width = Math.max(minWidth,
            Math.max(...buttons.map(button => stringWidth(button.text, fontSize))) + textPadding * 2 + padding * 2)
        const height = buttons.length * buttonHeight + padding * 2

        const { x: left, y: top } = placeNear(point, width, height, offset, window)

        return { left, top, width, height }
    }

    private buildContextMenu(items: QueueItemsBuilder,
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

        this.contextMenuHover.length = buttons.length

        items.rect()
             .position(toX(left), toY(top))
             .size(toWidth(width), toHeight(height))
             .fill()
             .round([menuRadius, menuRadius, menuRadius, menuRadius])
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.contextMenuBackground)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.ContextMenu - 20)
             .temp()

        buttons.forEach((button, index) => {
            const x = left + padding
            const y = top + padding + index * buttonHeight
            const buttonWidth = width - padding * 2

            const isOver = !!mouse
                           && x <= mouse.x && mouse.x <= x + buttonWidth
                           && y <= mouse.y && mouse.y <= y + buttonHeight

            const hover = this.contextMenuHover[index] ??= new HoverProgress()

            if (isInteractive)
                hover.step(isOver, now, Animations.button)

            const color = hover.isIdle
                          ? Theme.contextMenuButton
                          : Theme.withAlpha(Theme.contextMenuButtonHover, hover.value)

            const rect = items.rect()
                              .position(toX(x), toY(y))
                              .size(toWidth(buttonWidth), toHeight(buttonHeight))
                              .round([buttonRadius, buttonRadius, buttonRadius, buttonRadius])
                              .fill()
                              .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                              .color(color)
                              .layer(Layer.ContextMenu - 10)

            if (isInteractive) {
                rect.contextMenuButton()
                    .onClick(button.action)
            } else {
                rect.temp()
            }

            items.text(button.text)
                 .position(toX(x + textPadding + fontSize / 2), toY(y + buttonHeight / 2))
                 .size(fontSize)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.ContextMenu)
                 .temp()
        })
    }

    private fade(fade: HoverProgress, isVisible: boolean, duration: number) {
        fade.step(isVisible, performance.now(), duration)

        return fade.value
    }

    private isOverContextMenu(point: Point) {
        const bounds = this.contextMenuBounds

        return !!bounds
               && bounds.left <= point.x && point.x <= bounds.left + bounds.width
               && bounds.top <= point.y && point.y <= bounds.top + bounds.height
    }

    destroy() {
        this.queue = []

        this.tooltipState = null
        this.tooltipFade = new HoverProgress()

        this.contextMenuState = null
        this.contextMenuFade = new HoverProgress()
        this.contextMenuHover = []
        this.contextMenuBounds = null

        this.isSorted = true
    }

    private getSorted() {
        if (!this.isSorted) {
            this.queue.sort((a, b) => { return a.layer - b.layer })
            this.isSorted = true
        }

        return this.queue
    }

    add(...actions: ((builder: QueueItemsBuilder) => void)[]) {
        return this.addItems(actions, false)
    }

    addInitialized(...actions: ((builder: QueueItemsBuilder) => void)[]) {
        return this.addItems(actions, true)
    }

    private addItems(actions: ((builder: QueueItemsBuilder) => void)[], isInitialized: boolean) {
        const builder = new QueueItemsBuilder(isInitialized)

        for (const a of actions) {
            a(builder)
        }

        const items = builder.dispose()

        this.queue = this.queue.concat(items)

        if (items.length > 0) {
            this.isSorted = false
        }

        return items
    }
}