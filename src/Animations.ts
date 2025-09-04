class Animations {
    #queue: Map<string, AnimationItem>

    constructor() {
        this.#queue = new Map()
    }

    add(id: string, type: number, value: AnimationItem) {
        const key = this.#getKey(id, type)
        if (!this.#queue.has(key))
            this.#queue.set(key, value)

        this.#process(key)
    }

    contains(id: string, type: number): boolean {
        return this.#queue.has(this.#getKey(id, type))
    }

    reload(id: string, type: AnimationType) {
        if (this.contains(id, type)) {
            let item = <AnimationItem>this.#queue.get(this.#getKey(id, type))

            item.timer = new Date()
        }
    }

    clear() {
        this.#queue.forEach((value, key) => !this.#is(key, AnimationType.Init) && this.#queue.delete(key))
    }

    #process(key: string) {
        const item = <AnimationItem>this.#queue.get(key),
            stamp = new Date(),
            passed = stamp.getTime() - (item.timer ?? stamp).getTime(),
            transition = passed > item.duration ? 1 : passed / item.duration,
            before = item.before ? item.before() : true

        if (!item.timer && before)
            item.timer = stamp

        if (before)
            item.body(transition)

        if (transition === 1 && (!before || item.continuous))
            this.#queue.delete(key)
    }

    #getKey(id: string, type: number) {
        return id + '_' + type
    }

    #is(key: string, type: number) {
        return key.endsWith('_' + type)
    }
}