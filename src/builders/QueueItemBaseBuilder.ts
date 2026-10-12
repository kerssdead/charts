import RenderItem from '../types/RenderItem'
import ButtonOptions from '../types/ButtonOptions'

export default class QueueItemBaseBuilder {
    protected current: RenderItem

    constructor() {
        this.current = new RenderItem()
    }

    /**
     * Returns configured item.
     *
     * @returns {RenderItem}
     */
    dispose(): RenderItem {
        return this.current
    }

    interact(): QueueItemBaseBuilder {
        this.current.isAnimate = true

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