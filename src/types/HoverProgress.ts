import Animations from '@/Animations'

export default class HoverProgress {
    private progress: number = 0

    private time: DOMHighResTimeStamp | null = null

    get value() {
        return Animations.getTransition(this.progress)
    }

    get isIdle() {
        return this.progress == 0
    }

    step(isOver: boolean, now: DOMHighResTimeStamp, duration: number): boolean {
        const delta = this.time == null ? 0 : now - this.time

        this.time = now

        const progress = Math.min(Math.max(this.progress + (isOver ? delta : -delta) / duration, 0), 1)
        const isChanged = progress != this.progress

        this.progress = progress

        if (!isOver && this.isIdle)
            this.time = null

        return isChanged
    }
}