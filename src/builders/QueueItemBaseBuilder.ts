import RenderItem from '@/types/RenderItem'
import ItemData from '@/types/ItemData'
import RenderItemBase from '@/types/interfaces/RenderItemBase'

export default class QueueItemBaseBuilder<S extends RenderItemBase = RenderItemBase> {
    readonly shape: S

    protected current: RenderItem

    constructor(shape: S) {
        this.shape = shape
        this.current = new RenderItem(shape)
    }

    dispose(): RenderItem {
        return this.current
    }

    interact(): this {
        this.current.isAnimate = true

        return this
    }

    init(duration: number, delay: number = 0, fade: boolean = false): this {
        this.current.animation.init = 0
        this.current.animation.initDuration = duration
        this.current.animation.initDelay = delay
        this.current.animation.initFade = fade

        return this
    }

    appearDelay(delay: number): this {
        this.current.animation.appearDelay = delay

        return this
    }

    hoverGroup(group: string): this {
        this.current.hoverGroup = group

        return this
    }

    tooltip(template: string): this {
        this.current.tooltipTemplate = template

        return this
    }

    data(data: ItemData | undefined): this {
        this.current.data = data ?? null

        return this
    }

    color(color: string): this {
        this.current.color = color

        return this
    }

    stroke(color: string): this {
        this.current.stroke = color

        return this
    }

    layer(layer: number): this {
        this.current.layer = layer

        return this
    }

    fixed(value: boolean = true): this {
        this.current.isFixed = value

        return this
    }

    key(value: string): this {
        this.current.key = value

        return this
    }

    ghost(value: boolean = true): this {
        this.current.isGhost = value

        if (value) {
            this.current.isAnimate = false
            this.current.tooltipTemplate = ''
            this.current.hasContextMenu = false
        }

        return this
    }

    axisValue(value: number): this {
        this.current.axisValue = value

        return this
    }

    fade(value: boolean): this {
        this.current.isFading = value

        return this
    }

    contextMenuButton() {
        this.current.isContextMenu = true

        return this
    }

    contextMenu() {
        this.current.hasContextMenu = true

        return this
    }

    onClick(action:() => void) {
        this.current.onClick = action

        return this
    }
}