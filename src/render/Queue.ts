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

        this.ctx.beginPath()

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

        for (const step of this.getSorted()) {
            step.render(this.ctx, window)
        }

        this.queue = this.queue.filter(item => !item.isTemp)
    }

    animate(point: Point | null) {
        if (!point) {
            return
        }

        // todo: return if current mouse point is changed from previous frame

        for (const item of this.queue) {
            item.animate(point)
        }
    }

    tooltip(window: CanvasWindow, point: Point | null) {
        if (!point) {
            return
        }

        // todo: return if current mouse point is changed from previous frame

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