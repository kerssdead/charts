import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import Point from '@/types/Point'
import { ItemFlag as f } from '@/static/ItemFlag'
import { Keys } from '@/static/Enums'

const NEXT_KEYS: string[] = [Keys.ArrowRight, Keys.ArrowDown]

const PREVIOUS_KEYS: string[] = [Keys.ArrowLeft, Keys.ArrowUp]

const ACTIVATION_KEYS: string[] = [Keys.Enter, Keys.Space]

const INACTIVE = -1

export default class KeyboardFocus {
    private index: number = INACTIVE

    private stops: RenderItem[] = []

    private stopsVersion = -1

    constructor(private readonly queue: Queue, private readonly onChange: () => void) {
    }

    get target(): RenderItem | null {
        return this.index === INACTIVE ? null : this.getStops()[this.index] ?? null
    }

    get point(): Point | null {
        return this.target?.focusPoint ?? null
    }

    clear() {
        if (this.index === INACTIVE)
            return

        this.index = INACTIVE

        this.onChange()
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.altKey || event.ctrlKey || event.metaKey)
            return false

        const target = this.target

        if (target && ACTIVATION_KEYS.includes(event.key))
            return this.activate(target)

        if (target && event.key === Keys.Escape) {
            this.clear()

            return true
        }

        return this.move(event.key)
    }

    private activate(target: RenderItem) {
        target.onClick?.()

        this.onChange()

        return true
    }

    private move(key: string) {
        const next = this.getNextIndex(key, this.getStops().length)

        if (next == null)
            return false

        this.index = next

        this.revealTarget()
        this.onChange()

        return true
    }

    private getNextIndex(key: string, count: number) {
        if (count === 0)
            return null

        if (key === Keys.Home)
            return 0

        if (key === Keys.End)
            return count - 1

        if (NEXT_KEYS.includes(key))
            return this.index === INACTIVE ? 0 : (this.index + 1) % count

        if (PREVIOUS_KEYS.includes(key))
            return this.index === INACTIVE ? count - 1 : (this.index - 1 + count) % count

        return null
    }

    private revealTarget() {
        const target = this.target
        const bounds = target?.focusBounds
        const panel = target?.panel

        if (!bounds || !panel?.canScroll || !target.is(f.Scrollable))
            return

        const { y, height } = panel.clip

        if (bounds.top < y)
            panel.glideBy(bounds.top - y)
        else if (bounds.bottom > y + height)
            panel.glideBy(bounds.bottom - y - height)
    }

    private getStops() {
        if (this.stopsVersion !== this.queue.version) {
            this.stops = this.queue.items
                             .filter(item => item.focusOrder != null && !item.is(f.Ghost))
                             .sort((a, b) => (a.focusOrder ?? 0) - (b.focusOrder ?? 0))
            this.stopsVersion = this.queue.version
        }

        return this.stops
    }
}