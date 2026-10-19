import ease from '@/animation/Animations'
import { clamp } from '@/helpers/Geometry'

export default class HoverProgress {
    static isInstant: boolean = false

    private progress: number = 0

    private time: DOMHighResTimeStamp | null = null

    private isOver: boolean = false

    get value() {
        return ease(this.progress)
    }

    get isIdle() {
        return this.progress == 0
    }

    get isAnimating() {
        return this.isOver ? this.progress < 1 : this.progress > 0
    }

    step(isOver: boolean, now: DOMHighResTimeStamp, duration: number): boolean {
        const delta = this.time == null ? 0 : now - this.time

        this.time = now
        this.isOver = isOver

        const progress = HoverProgress.isInstant
                         ? isOver ? 1 : 0
                         : clamp(this.progress + (isOver ? delta : -delta) / duration, 0, 1)
        const isChanged = progress != this.progress

        this.progress = progress

        if (!isOver && this.isIdle)
            this.time = null

        return isChanged
    }
}