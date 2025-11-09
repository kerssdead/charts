import AnimationItem from 'types/AnimationItem'
import { AnimationType } from 'static/Enums'
import * as Constants from 'static/constants/Index'

class Animations {
    #queue: Map<string, AnimationItem>

    static transitionCurve: Map<number, number> = new Map()

    constructor() {
        this.#queue = new Map()
    }

    handle(id: string, type: AnimationType, value: AnimationItem) {
        const key = this.#getKey(id, type)
        if (!this.#queue.has(key))
            this.#queue.set(key, value)

        this.#process(key)
    }

    contains(id: string, type: AnimationType): boolean {
        return this.#queue.has(this.#getKey(id, type))
    }

    reload(id: string, type: AnimationType) {
        if (this.contains(id, type)) {
            let item = <AnimationItem>this.#queue.get(this.#getKey(id, type))

            item.timer = new Date()
        }
    }

    clear() {
        this.#queue.forEach((_value, key) => !this.#is(key, AnimationType.Init) && this.#queue.delete(key))
    }

    reverse(id: string, type: AnimationType) {
        if (this.contains(id, type)) {
            let item = <AnimationItem>this.#queue.get(this.#getKey(id, type)),
                stamp = new Date(),
                passed = stamp.getTime() - (item.timer ?? stamp).getTime()

            let reversedPassed = passed > item.duration ? 1 : item.duration - passed

            item.timer = new Date(new Date().getTime() - reversedPassed)
            item.backward = !item.backward
        }
    }

    isBackward(id: string, type: AnimationType) {
        return (this.#queue.get(this.#getKey(id, type)) as AnimationItem)?.backward ?? false
    }

    isEnd(id: string, type: AnimationType) {
        let item = <AnimationItem>this.#queue.get(this.#getKey(id, type)),
            stamp = new Date(),
            passed = stamp.getTime() - (item.timer ?? stamp).getTime()

        return passed >= item.duration
    }

    end(id: string, type: AnimationType) {
        let item = <AnimationItem>this.#queue.get(this.#getKey(id, type))

        if (item)
            item.timer = Constants.Dates.minDate
    }

    #process(key: string) {
        const item = <AnimationItem>this.#queue.get(key),
            stamp = new Date(),
            passed = stamp.getTime() - (item.timer ?? stamp).getTime(),
            transition = Animations.getTransition(passed > item.duration ? 1 : passed / item.duration),
            before = item.before ? item.before() : true

        if (!item.timer && before)
            item.timer = stamp

        if (before)
            item.body(item.backward ? 1 - transition : transition)

        if (transition == 1 && (!before || item.continuous))
            this.#queue.delete(key)
    }

    #getKey(id: string, type: number) {
        return id + '_' + type
    }

    #is(key: string, type: number) {
        return key.endsWith('_' + type)
    }

    static initializeTransitions() {
        const valuesCount = 22820,
            offset = .23,
            p0 = { x: 0, y: 0 },
            p1 = { x: 1 - offset, y: offset },
            p2 = { x: offset, y: 1 - offset },
            p3 = { x: 1, y: 1 }

        for (let i = 0; i < valuesCount; i++) {
            const t = (i + 1) / valuesCount

            let x = Math.pow(1 - t, 3) * p0.x
                    + 3 * Math.pow(1 - t, 2) * p1.x * t
                    + 3 * (1 - t) * Math.pow(t, 2) * p2.x
                    + Math.pow(t, 3) * p3.x,
                y = Math.pow(1 - t, 3) * p0.y
                    + 3 * Math.pow(1 - t, 2) * p1.y * t
                    + 3 * (1 - t) * Math.pow(t, 2) * p2.y
                    + Math.pow(t, 3) * p3.y

            Animations.transitionCurve.set(+x.toFixed(4), y)
        }

        Animations.transitionCurve.set(0, 0)
    }

    static getTransition(value: number): number {
        return Animations.transitionCurve.get(+value.toFixed(4)) ?? 0
    }
}

export default Animations