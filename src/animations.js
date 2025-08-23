class OAnimations {
    /**
     * @type {Map<string, OAnimationItem>}
     */
    #queue

    constructor() {
        this.#queue = new Map()
    }

    /**
     * @param object {OBasePoint}
     * @param type {number}
     * @param value {OAnimationItem}
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
     *
     * @return {boolean}
     */
    contains(object, type) {
        return this.#queue.has(this.#getKey(object, type))
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
        const item = this.#queue.get(key),
            stamp = new Date(),
            passed = stamp - (item.timer ?? stamp),
            transition = passed > item.duration ? 1 : passed / item.duration,
            before = item.before ? item.before() : true

        if (!item.timer && before)
            item.timer = stamp

        if (before)
            item.body(transition)

        if (transition === 1 && (!before || item.continuous))
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