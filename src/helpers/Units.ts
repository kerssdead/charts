import Point from '@/types/Point'

export default class Units {
    private readonly pixel: Point

    constructor(pixel: Point) {
        this.pixel = pixel
    }

    x(px: number) {
        return px * this.pixel.x
    }

    y(px: number) {
        return px * this.pixel.y
    }

    toPxX(value: number) {
        return value / this.pixel.x
    }

    toPxY(value: number) {
        return value / this.pixel.y
    }
}