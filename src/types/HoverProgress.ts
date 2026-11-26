import ease from '@/animation/Animations'
import { clamp } from '@/helpers/Geometry'

export default class HoverProgress {
    private progress = 0

    private time: DOMHighResTimeStamp | null = null

    private isOver = false

    get value() {
        return ease(this.progress)
    }

    get isIdle() {
        return this.progress === 0
    }

    get isAnimating() {
        return this.isOver ? this.progress < 1 : this.progress > 0
    }

    step(isOver: boolean, now: DOMHighResTimeStamp, duration: number, isInstant = false) {
        const delta = this.time == null ? 0 : Math.max(now - this.time, 0)

        this.time = now
        this.isOver = isOver

        const progress = this.getNextProgress(isOver, delta, duration, isInstant)
        const isChanged = progress !== this.progress

        this.progress = progress

        if (isOver ? progress === 1 : this.isIdle)
            this.time = null

        return isChanged
    }

    private getNextProgress(isOver: boolean, delta: number, duration: number, isInstant: boolean) {
        if (isInstant)
            return isOver ? 1 : 0

        return clamp(this.progress + (isOver ? delta : -delta) / duration, 0, 1)
    }
}