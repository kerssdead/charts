import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import RenderItem from 'types/RenderItem'
import CanvasWindow from 'types/CanvasWindow'
import Point from 'types/Point'
import ButtonOptions from 'types/ButtonOptions'
import Theme from 'Theme'
import { ContextMenu, COORDS_MAX_X, COORDS_MAX_Y, Layer, Tooltip } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from 'static/Enums'
import { stringWidth } from 'Helper'
import Animations from 'Animations'

type Fade = {
    progress: number
    timer: DOMHighResTimeStamp | null
}

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

    private tooltipFade: Fade = { progress: 0, timer: null }

    private contextMenuState: { point: Point, buttons: ButtonOptions[] } | null = null

    private contextMenuFade: Fade = { progress: 0, timer: null }

    private contextMenuHover: number[] = []

    private contextMenuTimer: DOMHighResTimeStamp | null = null

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

        for (const item of this.queue) {
            item.animate(point)
        }
    }

    tooltip(window: CanvasWindow, point: Point | null, isContextMenuOpen: boolean) {
        let template: string | null = null

        if (point && !isContextMenuOpen) {
            for (const item of this.queue) {
                item.tooltip(point)

                if (template == null && item.showTooltip) {
                    template = item.tooltipTemplate
                }
            }
        }

        const isVisible = point != null && template != null

        if (isVisible) {
            this.tooltipState = { point: point as Point, template: template as string }
        } else if (this.tooltipState && point) {
            this.tooltipState.point = point
        }

        const alpha = this.stepFade(this.tooltipFade, isVisible, Tooltip.fadeDuration)

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

    contextMenu(window: CanvasWindow, point: Point | null, mouse: Point | null, isOpen: boolean) {
        this.queue = this.queue.filter(item => !item.isContextMenu)

        let target: RenderItem | undefined

        if (isOpen && point) {
            for (const item of this.queue) {
                item.contextMenu(point)
            }

            target = this.queue.find(item => item.hasContextMenu && item.showContextMenu)
        }

        const isVisible = point != null && target != null

        if (isVisible) {
            if (this.contextMenuState?.point !== point) {
                this.contextMenuHover = []
            }

            this.contextMenuState = { point: point as Point, buttons: (target as RenderItem).contextMenuItems }
        }

        const alpha = this.stepFade(this.contextMenuFade, isVisible, ContextMenu.fadeDuration)

        if (!isVisible && alpha == 0) {
            this.contextMenuState = null
            this.contextMenuHover = []
            this.contextMenuTimer = null
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
        const { offset, padding } = Tooltip

        const pos = {
            x: RenderItem.reAdjustX(window, point.x) + offset,
            y: RenderItem.reAdjustY(window, point.y) + offset
        }

        let alignOffset = {
            x: 0,
            y: 0
        }

        let allRows = template.split('\n')

        let width = Math.max(...allRows.map(row => stringWidth(row)))
        let height = (allRows.length + 1) * Tooltip.rowHeight

        if (point.x + width + offset + padding > window.width) {
            alignOffset.x = -RenderItem.reAdjustX(window, width) - padding * 2
        }

        if (point.y + height + offset + padding > window.height) {
            alignOffset.y = -RenderItem.reAdjustY(window, height) - padding * 2
        }

        items.rect()
             .position(pos.x + alignOffset.x, pos.y + alignOffset.y)
             .size(RenderItem.reAdjustX(window, width) + padding,
                 RenderItem.reAdjustY(window, height))
             .fill()
             .round([Tooltip.radius, Tooltip.radius, Tooltip.radius, Tooltip.radius])
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .color(Theme.background)
             .stroke(Theme.dropdownBorder)
             .layer(Layer.Tooltip)
             .temp()

        let rowIndex = 0
        for (const row of allRows) {
            items.text(row)
                 .position(pos.x + padding * 1.25 + alignOffset.x,
                     pos.y + padding * 1.75 + RenderItem.reAdjustY(window, rowIndex * Tooltip.rowSpacing) + alignOffset.y)
                 .align(TextAlignment.Left)
                 .color(Theme.text)
                 .layer(Layer.Tooltip)
                 .temp()

            rowIndex++
        }
    }

    private getContextMenuBounds(window: CanvasWindow, point: Point, buttons: ButtonOptions[]): Bounds {
        const { offset, padding, buttonHeight, textPadding, fontSize, minWidth } = ContextMenu

        const width = Math.max(minWidth,
            Math.max(...buttons.map(button => stringWidth(button.text, fontSize))) + textPadding * 2 + padding * 2)
        const height = buttons.length * buttonHeight + padding * 2

        // open to the right/bottom of cursor, flip if it does not fit
        let left = point.x + offset
        let top = point.y + offset

        if (left + width > window.x + window.width) {
            left = point.x - offset - width
        }

        if (top + height > window.y + window.height) {
            top = point.y - offset - height
        }

        left = Math.max(left, window.x)
        top = Math.max(top, window.y)

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

        const toX = (x: number) => {
            return RenderItem.reAdjustX(window, x)
        }
        const toY = (y: number) => {
            return RenderItem.reAdjustY(window, y)
        }
        const toWidth = (w: number) => {
            return w * COORDS_MAX_X / window.width
        }
        const toHeight = (h: number) => {
            return h * COORDS_MAX_Y / window.height
        }

        const now = performance.now()
        const delta = (now - (this.contextMenuTimer ?? now)) / ContextMenu.hoverDuration
        this.contextMenuTimer = now

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

            let progress = this.contextMenuHover[index] ?? 0

            if (isInteractive) {
                progress = Math.min(Math.max(progress + (isOver ? delta : -delta), 0), 1)
                this.contextMenuHover[index] = progress
            }

            const color = progress == 0
                          ? Theme.contextMenuButton
                          : Theme.withAlpha(Theme.contextMenuButtonHover, Animations.getTransition(progress))

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

    private stepFade(fade: Fade, isVisible: boolean, duration: number) {
        const now = performance.now()
        const delta = (now - (fade.timer ?? now)) / duration

        fade.timer = now
        fade.progress = Math.min(Math.max(fade.progress + (isVisible ? delta : -delta), 0), 1)

        return Animations.getTransition(fade.progress)
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
        this.tooltipFade = { progress: 0, timer: null }

        this.contextMenuState = null
        this.contextMenuFade = { progress: 0, timer: null }
        this.contextMenuHover = []
        this.contextMenuTimer = null
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