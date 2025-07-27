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
     * @param object {Object}
     * @param type {number}
     *
     * @return {boolean}
     */
    contains(object, type) {
        return this.#queue.has({
            type: type,
            hash: object.hashCode()
        }.hashCode())
    }

    any() {
        return this.#queue.size > 0
    }

    /**
     * @param key {string}
     */
    #process(key) {
        let item = this.#queue.get(key)

        const stamp = new Date(),
            passed = stamp - item.timer

        const before = item.before(item, passed, item.duration)

        if (!item.timer && before)
            item.timer = new Date()

        if (before)
            item.body(passed, item.duration)

        if (passed > item.duration && !before)
            this.#queue.delete(key)
    }
}