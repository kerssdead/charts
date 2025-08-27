export class OAnimationItem {
    /**
     * @type {Date|null}
     */
    timer

    /**
     * @type {function():boolean}
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
    continuous
}