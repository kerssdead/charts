import HoverProgress from '@/types/HoverProgress'
import { AnimationTiming } from '@/static/constants/Index'

export default class HoverMap<K> {
    isAnimating: boolean = false

    private items = new Map<K, HoverProgress>()

    update(targets: [K, boolean][], now: DOMHighResTimeStamp): boolean {
        const items = new Map<K, HoverProgress>()

        let isChanged = false

        this.isAnimating = false

        for (const [key, isOver] of targets) {
            const hover = this.items.get(key) ?? new HoverProgress()

            isChanged = hover.step(isOver, now, AnimationTiming.button) || isChanged

            this.isAnimating ||= hover.isAnimating

            items.set(key, hover)
        }

        this.items = items

        return isChanged
    }

    get(key: K) {
        return this.items.get(key)
    }

    keys() {
        return this.items.keys()
    }

    value(key: K) {
        return this.items.get(key)?.value ?? 0
    }

    clear() {
        this.items.clear()
        this.isAnimating = false
    }
}