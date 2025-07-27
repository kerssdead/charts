class AnimationItem {
    /**
     * @type {Date}
     */
    timer

    /**
     * @type {function(arg1:AnimationItem, arg2:number, arg3:number):boolean}
     */
    before

    /**
     * @type {function(arg1:number, arg2:number)}
     */
    body

    /**
     * @type {number}
     */
    duration
}