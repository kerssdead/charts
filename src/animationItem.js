class OAnimationItem {
    /**
     * @type {Date|null}
     */
    timer

    /**
     * @type {function(arg1:OAnimationItem, arg2:number, arg3:number):boolean}
     */
    before

    /**
     * @type {function(arg1:number)}
     */
    body

    /**
     * @type {number}
     */
    duration

    /**
     * @type {boolean}
     */
    inProgress

    /**
     * @type {boolean}
     */
    continuous
}