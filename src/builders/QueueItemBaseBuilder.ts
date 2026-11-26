import RenderItem from '@/types/RenderItem'
import ItemData from '@/types/ItemData'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import { Tooltip } from '@/types/Tooltip'
import { ItemFlag as f } from '@/static/ItemFlag'
import { FocusOrder } from '@/static/Enums'

export default class QueueItemBaseBuilder<S extends RenderItemBase = RenderItemBase> {
    protected current: RenderItem

    constructor(readonly shape: S) {
        this.current = new RenderItem(shape)
    }

    build(): RenderItem {
        return this.current
    }

    protected chain(update: () => void): this {
        update()

        return this
    }

    interact() {
        return this.chain(() => this.current.set(f.Interactive, true))
    }

    init(duration: number, delay = 0, fade = false) {
        return this.chain(() => {
            this.current.animation.init = 0
            this.current.animation.initDuration = duration
            this.current.animation.initDelay = delay
            this.current.animation.initFade = fade
        })
    }

    appearDelay(delay: number) {
        return this.chain(() => this.current.animation.appearDelay = delay)
    }

    appearDuration(duration: number) {
        return this.chain(() => this.current.animation.appearDuration = duration)
    }

    hoverGroup(group: string) {
        return this.chain(() => this.current.hoverGroup = group)
    }

    tooltip(template: Tooltip) {
        return this.chain(() => this.current.tooltipTemplate = template)
    }

    data(data: ItemData | undefined) {
        return this.chain(() => this.current.data = data ?? null)
    }

    color(color: string) {
        return this.chain(() => this.current.color = color)
    }

    stroke(color: string) {
        return this.chain(() => this.current.stroke = color)
    }

    layer(layer: number) {
        return this.chain(() => this.current.layer = layer)
    }

    fixed(value = true) {
        return this.chain(() => this.current.set(f.Fixed, value))
    }

    key(value: string) {
        return this.chain(() => this.current.key = value)
    }

    ghost(value = true) {
        return this.chain(() => this.current.setGhost(value))
    }

    axisValue(value: number) {
        return this.chain(() => this.current.axisValue = value)
    }

    fade(value: boolean) {
        return this.chain(() => this.current.set(f.Fading, value))
    }

    monochrome() {
        return this.chain(() => this.current.set(f.Monochrome, true))
    }

    contextMenu() {
        return this.chain(() => this.current.set(f.ContextMenu, true))
    }

    focusable(order: FocusOrder = FocusOrder.Chart) {
        return this.chain(() => this.current.focusOrder = order)
    }

    onClick(action: () => void) {
        return this.chain(() => this.current.onClick = action)
    }
}