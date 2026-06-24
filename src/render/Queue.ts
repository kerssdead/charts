import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import RenderItem from '../types/RenderItem'
import CanvasWindow from '../types/CanvasWindow'

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

    // private dequeue(step: RenderStep) {
    //     // todo: not implemented
    // }

    add(action: (builder: QueueItemsBuilder) => void) {
        const builder = new QueueItemsBuilder()

        action(builder)

        this.queue = this.queue.concat(builder.dispose())
    }
}