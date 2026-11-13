export default class AnimationFrame {
    private id: number | null = null

    private readonly tick: FrameRequestCallback

    constructor(draw: (timestamp: DOMHighResTimeStamp) => void) {
        this.tick = timestamp => {
            this.id = null

            draw(timestamp)
        }
    }

    request() {
        this.id ??= requestAnimationFrame(this.tick)
    }

    cancel() {
        if (this.id == null)
            return

        cancelAnimationFrame(this.id)
        this.id = null
    }
}