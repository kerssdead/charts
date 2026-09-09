import QueueItemBaseBuilder from './QueueItemBaseBuilder'
import { RenderStepType, TextAlignment } from '../static/Enums'
import RenderItemLine from '../types/RenderItemLine'
import RenderItemText from '../types/RenderItemText'

export default class QueueTextItemBuilder
    extends QueueItemBaseBuilder {
    constructor(text: string) {
        super()

        this.current.type = RenderStepType.Text
        this.current.text = new RenderItemText()
        this.current.text.value = text
    }

    position(x: number, y: number) {
        this.current.text.x = x
        this.current.text.y = y

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
}