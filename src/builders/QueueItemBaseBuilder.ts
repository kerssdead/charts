import RenderItem from '../types/RenderItem'
import ButtonOptions from '../types/ButtonOptions'

export default class QueueItemBaseBuilder {
    protected current: RenderItem

    constructor() {
        this.current = new RenderItem()
    }

    dispose(): RenderItem {
        return this.current
    }

    interact(): QueueItemBaseBuilder {
        this.current.isAnimate = true

        return this
    }

    init(duration: number, delay: number = 0): QueueItemBaseBuilder {
        this.current.animation.init = 0
        this.current.animation.initDuration = duration
        this.current.animation.initDelay = delay

        return this
    }

    tooltip(template: string): QueueItemBaseBuilder {
        this.current.tooltipTemplate = template

        return this
    }

    color(color: string): QueueItemBaseBuilder {
        this.current.color = color
        this.current.activeColor = color

        return this
    }

    stroke(color: string): QueueItemBaseBuilder {
        this.current.stroke = color
        this.current.activeStroke = color

        return this
    }

    layer(layer: number) : QueueItemBaseBuilder {
        this.current.layer = layer

        return this
    }

    temp(value: boolean = true) : QueueItemBaseBuilder {
        this.current.isTemp = value

        return this
    }

    fixed(value: boolean = true) : QueueItemBaseBuilder {
        this.current.isFixed = value

        return this
    }

    key(value: string) : QueueItemBaseBuilder {
        this.current.key = value

        return this
    }

    ghost(value: boolean = true) : QueueItemBaseBuilder {
        this.current.isGhost = value

        if (value) {
            this.current.isAnimate = false
            this.current.tooltipTemplate = ''
            this.current.contextMenuItems = []
        }

        return this
    }

    axisValue(value: number) : QueueItemBaseBuilder {
        this.current.axisValue = value

        return this
    }

    fade(value: boolean) : QueueItemBaseBuilder {
        this.current.isFading = value

        return this
    }

    debug() {
        this.current.isDebug = true

        return this
    }

    contextMenuButton() {
        this.current.isContextMenu = true

        return this
    }

    contextMenu(items: ButtonOptions[]) {
        this.current.contextMenuItems = items

        return this
    }

    onClick(action:() => void) {
        this.current.onClick = action

        return this
    }
}