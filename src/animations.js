class Animations {
    /**
     * @type {Map<string, AnimationItem>}
     */
    #queue

    constructor() {
        this.#queue = new Map()
    }

    /**
     * @param object {BasePoint}
     * @param type {number}
     * @param value {AnimationItem}
     */
    add(object, type, value) {
        const key = this.#getKey(object, type)
        if (!this.#queue.has(key))
            this.#queue.set(key, value)

        this.#process(key)
    }

    /**
     * @param object {Object}
     * @param type {number}
     */
    delete(object, type) {
        this.#queue.delete(this.#getKey(object, type))
    }

    /**
     * @param object {Object}
     * @param type {number}
     *
     * @return {boolean}
     */
    contains(object, type) {
        return this.#queue.has(this.#getKey(object, type))
    }

    any() {
        return this.#queue.size > 0
    }

    /**
     * @param object {Object}
     * @param type {number}
     */
    reload(object, type) {
        if (this.contains(object, type)) {
            let item = this.#queue.get(this.#getKey(object, type))

            item.timer = new Date()
        }
    }

    /**
     * @param key {string}
     */
    #process(key) {
        let item = this.#queue.get(key)

        const stamp = new Date(),
            passed = stamp - (item.timer ?? stamp)

        const before = item.before(item, passed, item.duration) ?? true

        if (!item.timer && before)
            item.timer = new Date()

        if (before)
            item.body(passed, item.duration)

        if (passed > item.duration && !before)
            this.#queue.delete(key)
    }

    /**
     * @param object {Object}
     * @param type {number}
     *
     * @return string
     */
    #getKey(object, type) {
        return object.id + type
    }
}