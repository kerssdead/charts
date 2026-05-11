import RenderStep from 'types/RenderStep'

export default class Queue {
    queue: RenderStep[]

    hash: number

    private ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx=ctx
    }

    render() {
        if (!this.isShouldRender())
            return

        for (const step of this.getSorted()) {
            this.dequeue(step)
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

    private dequeue(step: RenderStep) {
        // todo: not implemented
    }
}