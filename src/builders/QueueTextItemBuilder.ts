import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import RenderItemText, { Orbit } from '@/types/RenderItemText'
import RenderItemArc from '@/types/RenderItemArc'

export default class QueueTextItemBuilder extends QueueItemBaseBuilder<RenderItemText> {
    constructor(text: string) {
        super(new RenderItemText(text))
    }

    position(x: number, y: number) {
        return this.chain(() => this.shape.absolute = { x, y })
    }

    orbit(angle: number, orbit: Orbit) {
        return this.chain(() => {
            this.shape.angle = angle
            this.shape.orbit = orbit
        })
    }

    follow(arc: RenderItemArc) {
        return this.chain(() => this.shape.follow = arc)
    }

    size(value: number) {
        return this.chain(() => this.shape.fontSize = value)
    }

    align(value: TextAlignment) {
        return this.chain(() => this.shape.alignment = value)
    }

    baseline(value: TextBaseline) {
        return this.chain(() => this.shape.baseline = value)
    }

    rotate(angle: number) {
        return this.chain(() => this.shape.rotate = angle)
    }

    clip(width: number) {
        return this.chain(() => this.shape.clipWidth = width)
    }
}