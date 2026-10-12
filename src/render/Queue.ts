import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import RenderItem from 'types/RenderItem'
import CanvasWindow from 'types/CanvasWindow'
import Point from 'types/Point'
import Theme from 'Theme'
import { Layer } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from 'static/Enums'
import { stringWidth } from 'Helper'

export default class Queue {
    queue: RenderItem[]

    ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.queue = []
        this.ctx = ctx
    }

    render(window: CanvasWindow) {
        if (!this.isShouldRender())
            return

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

        for (const step of this.getSorted()) {
            this.ctx.save()
            this.ctx.beginPath()

            this.ctx.globalAlpha = step.animation.alpha

            step.render(this.ctx, window)

            this.ctx.restore()
        }

        this.queue = this.queue.filter(item => !item.isTemp)

        for (let step of this.queue.filter(item => item.isContextMenu)) {
            step.isTemp = true
        }
    }

    animate(point: Point | null) {
        if (!point) {
            return
        }

        for (const item of this.queue) {
            item.animate(point)
        }
    }

    tooltip(window: CanvasWindow, point: Point | null, isContextMenuOpen: boolean) {
        if (!point || isContextMenuOpen) {
            return
        }

        const offset = 50
        const padding = 50

        const pos = {
            x: RenderItem.reAdjustX(window, point.x) + offset,
            y: RenderItem.reAdjustY(window, point.y) + offset
        }

        for (const item of this.queue) {
            item.tooltip(point)

            if (item.showTooltip) {
                let alignOffset = {
                    x: 0,
                    y: 0
                }

                let allRows = item.tooltipTemplate.split('\n')

                let width = Math.max(...allRows.map(row => stringWidth(row)))
                let height = (allRows.length + 1) * 14

                if (point.x + width + offset + padding > window.width) {
                    alignOffset.x = -RenderItem.reAdjustX(window, width) - padding * 2
                }

                if (point.y + height + offset + padding > window.height) {
                    alignOffset.y = -RenderItem.reAdjustY(window, height) - padding * 2
                }

                this.add((items: QueueItemsBuilder) => {
                    items.rect()
                         .position(pos.x + alignOffset.x, pos.y + alignOffset.y)
                         .size(RenderItem.reAdjustX(window, width) + padding,
                             RenderItem.reAdjustY(window, height))
                         .fill()
                         .round([4, 4, 4, 4])
                         .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                         .color(Theme.background)
                         .stroke(Theme.dropdownBorder)
                         .layer(Layer.Tooltip)
                         .temp()

                    let rowIndex = 0
                    for (const row of allRows) {
                        items.text(row)
                             .position(pos.x + padding * 1.25 + alignOffset.x,
                                 pos.y + padding * 1.75 + RenderItem.reAdjustY(window, rowIndex * 16) + alignOffset.y)
                             .align(TextAlignment.Left)
                             .color(Theme.text)
                             .layer(Layer.Tooltip)
                             .temp()

                        rowIndex++
                    }
                })
            }
        }
    }

    contextMenu(window: CanvasWindow, point: Point | null, isOpen: boolean) {
        const isNullPoint = point == null

        if (!isOpen || isNullPoint) {
            return
        }

        const offset = 40
        const padding = 50
        const buttonHeight = 128

        const pos = {
            x: RenderItem.reAdjustX(window, point.x) + offset,
            y: RenderItem.reAdjustY(window, point.y) + offset
        }

        for (const item of this.queue) {
            item.contextMenu(point)

            if (item.hasContextMenu && item.showContextMenu) {
                let alignOffset = {
                    x: 0,
                    y: 0
                }

                let allItems = item.contextMenuItems

                let width = Math.max(...allItems.map(button => stringWidth(button.text))) * 6
                let height = (allItems.length + 1) * buttonHeight

                // todo: fix horizontal overflow
                // if (point.x + width + offset + padding > window.width) {
                //     alignOffset.x = -RenderItem.reAdjustX(window, width) - padding * 2
                // }

                // todo: fix vertical overflow
                // if (point.y + height + offset + padding > window.height) {
                //     alignOffset.y = -RenderItem.reAdjustY(window, height) - padding * 2
                // }

                this.add((items: QueueItemsBuilder) => {
                    items.rect()
                         .position(pos.x, pos.y)
                         .size(width, height)
                         .fill()
                         .round([4, 4, 4, 4])
                         .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                         .color(Theme.background)
                         .stroke(Theme.dropdownBorder)
                         .layer(Layer.ContextMenu - 20)
                         .temp()

                    let rowIndex = 0
                    for (const button of allItems) {
                        const x = pos.x
                                  + padding + alignOffset.x
                        const y = pos.y
                                  + padding
                                  + RenderItem.reAdjustY(window, rowIndex * 24)
                                  + alignOffset.y

                        items.rect()
                             .position(x - padding / 4, y)
                             .size(width - padding * 2 + padding / 4, buttonHeight)
                             .round([4, 4, 4, 4])
                             .fill()
                             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                             .color(Theme.dropdownItemHoverColor)
                             .layer(Layer.ContextMenu - 10)
                             .contextMenuButton()
                             .onClick(button.action)

                        items.text(button.text)
                             .position(x + padding, y + padding)
                             .align(TextAlignment.Left)
                             .color(Theme.text)
                             .layer(Layer.ContextMenu)
                             .temp()

                        rowIndex++
                    }
                })
            }
        }
    }

    private getHash() {
        // todo: not implemented

        return 0
    }

    private isShouldRender() {
        return true

        // todo: muted for test, unmute

        // const nowHash = this.getHash()
        //
        // if (this.hash == nowHash)
        //     return false
        //
        // this.hash = nowHash
        //
        // return true
    }

    private getSorted() {
        return this.queue.sort((a, b) => a.layer - b.layer)
    }

    add(...actions: ((builder: QueueItemsBuilder) => void)[]) {
        const builder = new QueueItemsBuilder()

        for (const a of actions) {
            a(builder)
        }

        this.queue = this.queue.concat(builder.dispose())
    }
}