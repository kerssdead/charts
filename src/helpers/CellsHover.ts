import HoverProgress from '@/types/HoverProgress'
import { AnimationTiming } from '@/static/constants/Index'

const ALPHA_DELTA = .5

export default class CellsHover {
    private readonly progress = new Map<number, HoverProgress>()

    private changes = 0

    get version() {
        return this.changes
    }

    step(target: number | null, now: DOMHighResTimeStamp, isInstant: boolean = false) {
        if (target !== null && !this.progress.has(target))
            this.progress.set(target, new HoverProgress())

        const changes = this.changes

        let isAnimating = false

        for (const [index, hover] of this.progress) {
            if (hover.step(index === target, now, AnimationTiming.hover, isInstant))
                this.changes++

            if (hover.isAnimating)
                isAnimating = true
            else if (hover.isIdle)
                this.progress.delete(index)
        }

        return isAnimating || this.changes !== changes
    }

    getAlpha(index: number) {
        const hover = this.progress.get(index)

        return hover ? 1 - ALPHA_DELTA * hover.value : 1
    }
}