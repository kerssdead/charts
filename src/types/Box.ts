export default class Box {
    width: number

    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    set(width: number, height: number) {
        this.width = width
        this.height = height
    }
}