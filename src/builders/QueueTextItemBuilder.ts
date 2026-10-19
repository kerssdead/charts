import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import RenderItemText, { Orbit } from '@/types/RenderItemText'
import RenderItemArc from '@/types/RenderItemArc'

export default class QueueTextItemBuilder
    extends QueueItemBaseBuilder<RenderItemText> {
    constructor(text: string) {
        super(new RenderItemText())

        this.shape.value = text
    }

    position(x: number, y: number) {
        this.shape.absolute = { x, y }

        return this
    }

    orbit(angle: number, orbit: Orbit) {
        this.shape.angle = angle
        this.shape.orbit = orbit

        return this
    }

    follow(arc: RenderItemArc) {
        this.shape.follow = arc

        return this
    }

    size(value: number) {
        this.shape.fontSize = value

        return this
    }

    align(value: TextAlignment) {
        this.shape.alignment = value

        return this
    }

    baseline(value: TextBaseline) {
        this.shape.baseline = value

        return this
    }

    rotate(angle: number) {
        this.shape.rotate = angle

        return this
    }
}