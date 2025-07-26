class Animations {
    /**
     * @type {Map<string, AnimationItem>}
     */
    #queue

    constructor() {
        this.#queue = new Map()
    }

    /**
     * @param object {Object}
     * @param type {number}
     * @param value {AnimationItem}
     */
    add(object, type, value) {
        const key = {
            type: type,
            hash: object.hashCode()
        }.hashCode()

        if (!this.#queue.has(key))
            this.#queue.set(key, value)

        this.#process(key)
    }

    /**
     * @param object {Object}
     * @param type {number}
     */
    delete(object, type) {
        this.#queue.delete({
            type: type,
            hash: object.hashCode()
        }.hashCode())
    }

    /**
     * @param key {string}
     */
    #process(key) {
        let item = this.#queue.get(key)
        const before = item.before()

        if (!item.timer && before)
            item.timer = new Date()

        const stamp = new Date()

        if (before)
            item.body(stamp - item.timer, item.duration)

        if (stamp - item.timer > item.duration && !before)
            this.#queue.delete(key)
    }
}