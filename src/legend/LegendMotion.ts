import Value from '@/types/base/Value'
import Point from '@/types/Point'
import ease from '@/animation/Animations'
import { lerp } from '@/helpers/Geometry'
import { AnimationTiming } from '@/static/constants/Index'
import { LegendEntry } from '@/legend/LegendLayout'

export default class LegendMotion {
    leaving: LegendEntry[] = []

    private readonly getKey: (value: Value) => string

    private start: DOMHighResTimeStamp | null = null

    private isPending: boolean = false

    private from: Map<string, Point> = new Map()

    private fromArea: DOMRect | undefined

    constructor(getKey: (value: Value) => string) {
        this.getKey = getKey
    }

    get isMoving() {
        return this.isPending || this.start != null
    }

    get isStarted() {
        return this.start != null
    }

    move(previous: LegendEntry[], previousArea: DOMRect | undefined, entries: LegendEntry[]) {
        const keys = new Set(entries.map(entry => this.getKey(entry.value)))

        this.fromArea = previousArea
        this.from = new Map(previous.map(entry => [this.getKey(entry.value), { x: entry.x, y: entry.y }]))
        this.leaving = previous.filter(entry => !keys.has(this.getKey(entry.value)))
        this.start = null
        this.isPending = true
    }

    begin(now: DOMHighResTimeStamp) {
        if (!this.isPending)
            return

        this.start = now
        this.isPending = false
    }

    finish() {
        this.start = null
        this.from.clear()
        this.fromArea = undefined
        this.leaving = []
    }

    getProgress(now: DOMHighResTimeStamp) {
        if (this.start == null)
            return 1

        const progress = Math.min((now - this.start) / AnimationTiming.legend, 1)

        return progress === 1 ? 1 : ease(progress)
    }

    hasFrom(entry: LegendEntry) {
        return this.from.has(this.getKey(entry.value))
    }

    getArea(area: DOMRect, progress: number) {
        const from = this.fromArea

        if (!from)
            return area

        return new DOMRect(
            lerp(from.x, area.x, progress),
            lerp(from.y, area.y, progress),
            lerp(from.width, area.width, progress),
            lerp(from.height, area.height, progress)
        )
    }

    getCurrent(entry: LegendEntry, progress: number): LegendEntry {
        const from = this.from.get(this.getKey(entry.value))

        return from
               ? { ...entry, x: lerp(from.x, entry.x, progress), y: lerp(from.y, entry.y, progress) }
               : entry
    }
}