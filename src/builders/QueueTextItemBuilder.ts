import QueueItemBaseBuilder from 'builders/QueueItemBaseBuilder'
import { TextAlignment, TextBaseline } from 'static/Enums'
import RenderItemText, { Orbit } from 'types/RenderItemText'
import RenderItemArc from 'types/RenderItemArc'

export default class QueueTextItemBuilder
    extends QueueItemBaseBuilder {
    constructor(text: string) {
        super()

        this.current.text = new RenderItemText()
        this.current.text.value = text
    }

    position(x: number, y: number) {
        this.current.text.x = x
        this.current.text.y = y

        return this
    }

    orbit(angle: number, orbit: Orbit) {
        this.current.text.angle = angle
        this.current.text.orbit = orbit

        return this
    }

    follow(arc: RenderItemArc) {
        this.current.text.follow = arc

        return this
    }

    size(value: number) {
        this.current.text.fontSize = value

        return this
    }

    align(value: TextAlignment) {
        this.current.text.alignment = value

        return this
    }

    baseline(value: TextBaseline) {
        this.current.text.baseline = value

        return this
    }

    rotate(angle: number) {
        this.current.text.rotate = angle

        return this
    }
}