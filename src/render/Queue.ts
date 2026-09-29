import QueueItemsBuilder from 'builders/QueueItemsBuilder'
import RenderItem from 'types/RenderItem'
import CanvasWindow from 'types/CanvasWindow'
import Point from 'types/Point'
import { Layer } from 'static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '../static/Enums'

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

        const pos = {
            x: RenderItem.reAdjustX(window, point.x) + offset,
            y: RenderItem.reAdjustY(window, point.y) + offset
        }

        for (const item of this.queue) {
            item.tooltip(point)

            if (item.showTooltip) {
                this.add((items: QueueItemsBuilder) => {
                    items.rect()
                         .position(pos.x, pos.y)
                         .size(200, 300)
                         .fill()
                         .round([4, 4, 4, 4])
                         .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                         .color('magenta')
                         .layer(Layer.Tooltip)
                         .temp()

                        items.text(item.tooltipTemplate)
                             .position(pos.x, pos.y)
                             .align(TextAlignment.Left)
                             .color('black')
                             .temp()
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