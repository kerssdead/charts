import Point from '@/types/Point'
import CanvasWindow from '@/types/CanvasWindow'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'

export default class Units {
    private readonly pixel: Point

    private readonly origin: Point

    constructor(pixel: Point, origin: Point = { x: 0, y: 0 }) {
        this.pixel = pixel
        this.origin = origin
    }

    static fromSize(width: number, height: number) {
        return new Units({ x: COORDS_MAX_X / width, y: COORDS_MAX_Y / height })
    }

    static fromWindow(window: CanvasWindow) {
        return new Units({ x: COORDS_MAX_X / window.width, y: COORDS_MAX_Y / window.height }, { x: window.x, y: window.y })
    }

    x(px: number) {
        return px * this.pixel.x
    }

    y(px: number) {
        return px * this.pixel.y
    }

    positionX(px: number) {
        return (px - this.origin.x) * this.pixel.x
    }

    positionY(px: number) {
        return (px - this.origin.y) * this.pixel.y
    }

    toPxX(value: number) {
        return value / this.pixel.x
    }

    toPxY(value: number) {
        return value / this.pixel.y
    }
}