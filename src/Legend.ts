import Value from '@/types/base/Value'
import { contains } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import Point from '@/types/Point'
import Frame from '@/types/Frame'
import Size from '@/types/Size'
import Paddings, { NO_PADDINGS } from '@/types/Paddings'
import RenderItem from '@/types/RenderItem'
import Overlay from '@/renderer/Overlay'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import Queue from '@/render/Queue'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import TextResources from '@/static/TextResources'
import { Layer } from '@/static/constants/Index'
import { LegendPlace } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import HoverMap from '@/types/HoverMap'
import LegendMotion from '@/legend/LegendMotion'
import LegendValues from '@/legend/LegendValues'
import { addLegendEntry, addResetButton } from '@/legend/LegendItems'
import { getHorizontalPlacement, getVerticalPlacement, LegendEntry } from '@/legend/LegendLayout'
import { BUTTON_TEXT_PADDING, ITEM_HEIGHT, PADDING_X, PADDING_Y, RESET_KEY, SIDES } from '@/legend/LegendConstants'

class Legend extends Overlay {
    settings: ChartSettings

    onChange: (() => void) | undefined

    private area: DOMRect | undefined

    private entries: LegendEntry[] = []

    private button: DOMRect | undefined

    private size: Size | undefined

    private units: Units = Units.fromSize(1, 1)

    private top: number = 0

    private backgrounds: Map<string, RenderItem> = new Map()

    private readonly hover = new HoverMap<string>()

    private isDirty: boolean = true

    private readonly values: LegendValues

    private readonly motion: LegendMotion

    constructor(settings: ChartSettings, onChange?: () => void) {
        super()

        this.settings = settings
        this.onChange = onChange
        this.values = new LegendValues(settings)
        this.motion = new LegendMotion(value => this.values.getKey(value))
    }

    get reserved(): Paddings {
        return this.getReserved(this.area)
    }

    getCurrentReserved(now: DOMHighResTimeStamp): Paddings {
        return this.getReserved(this.area && this.motion.getArea(this.area, this.motion.getProgress(now)))
    }

    get isMoving() {
        return this.motion.isMoving
    }

    private getReserved(area: DOMRect | undefined): Paddings {
        const reserved = { ...NO_PADDINGS }

        if (!area)
            return reserved

        const side = SIDES[this.settings.legendPlace] ?? 'bottom'

        reserved[side] = this.isVertical ? area.width : area.height

        return reserved
    }

    private get isVertical() {
        return this.settings.legendPlace === LegendPlace.Left
               || this.settings.legendPlace === LegendPlace.Right
    }

    private get buttonWidth() {
        return this.settings.disableInteractions
               ? 0
               : stringWidth(TextResources.reset) + BUTTON_TEXT_PADDING
    }

    private get hasSize() {
        return !!this.size && this.size.width > 0 && this.size.height > 0
    }

    private get isAnimating() {
        return this.hover.isAnimating || this.isMoving || this.values.isToggling
    }

    applySettings(settings?: ChartSettings) {
        const previous = this.entries
        const previousArea = this.area

        if (settings) {
            this.settings = settings
            this.values.apply(settings)
        }

        if (this.size)
            this.resize(this.size.width, this.size.height, this.top)

        if (settings && previous.length > 0 && !settings.staticMode) {
            this.motion.move(previous, previousArea, this.entries)
            this.isDirty = true
        }
    }

    resize(width: number, height: number, top: number = 0) {
        this.size = { width, height }
        this.units = Units.fromSize(width, height)
        this.top = top

        const options = {
            values: this.values.getVisible(),
            place: this.settings.legendPlace,
            top,
            buttonWidth: this.buttonWidth
        }
        const { area, entries } = this.isVertical
                                  ? getVerticalPlacement(this.size, options)
                                  : getHorizontalPlacement(this.size, options)

        this.area = area
        this.entries = entries

        this.button = this.settings.disableInteractions
                      ? undefined
                      : new DOMRect(
                          area.x + area.width - PADDING_X - this.buttonWidth,
                          area.y + PADDING_Y,
                          this.buttonWidth,
                          ITEM_HEIGHT
                      )

        this.isDirty = true
    }

    update({ queue, mouse, now }: Frame): boolean {
        if (!this.area || !this.hasSize) {
            this.clear(queue)

            return false
        }

        this.motion.begin(now)
        this.values.updateToggles(now)

        const isHoverChanged = this.updateHover(mouse, now)

        if (!this.isDirty && !this.motion.isStarted) {
            if (isHoverChanged)
                this.updateBackgrounds()

            return this.isAnimating
        }

        this.build(queue, this.area, this.motion.getProgress(now))

        return this.isAnimating
    }

    clear(queue: Queue) {
        this.isDirty = true
        this.backgrounds.clear()

        this.remove(queue)
    }

    destroy(queue: Queue) {
        this.clear(queue)
        this.hover.clear()
        this.values.clear()
        this.entries = []
        this.area = undefined
    }

    private build(queue: Queue, area: DOMRect, progress: number) {
        this.clear(queue)

        const builder = new QueueItemsBuilder()

        builder.rect()
               .box(this.units, this.motion.getArea(area, progress))
               .fill()
               .color(Theme.canvasBackground)
               .layer(Layer.Legend)
               .fixed()
               .onClick(() => {
                   this.isDirty = true
               })

        const resetBackground = this.button && addResetButton(builder, this.units, this.button, {
            hover: this.hover.value(RESET_KEY),
            onClick: () => this.reset()
        })
        const added = builder.build()

        if (resetBackground)
            this.backgrounds.set(RESET_KEY, resetBackground)

        this.entries.forEach(entry => {
            const current = this.motion.getCurrent(entry, progress)
            const alpha = this.motion.hasFrom(entry) ? 1 : progress
            const { items, background } = this.createEntry(current, this.hover.value(entry.value.id), alpha)

            this.backgrounds.set(entry.value.id, background)

            added.push(...items)
        })

        for (const entry of this.motion.leaving)
            added.push(...this.createEntry(entry, 0, 1 - progress).items)

        if (progress === 1)
            this.motion.finish()

        this.show(queue, added)

        this.isDirty = false
    }

    private createEntry(entry: LegendEntry, hover: number, alpha: number) {
        const builder = new QueueItemsBuilder()
        const background = addLegendEntry(builder, this.units, entry, {
            hover,
            onClick: () => this.toggle(entry.value)
        })
        const items = builder.build()

        for (const item of items)
            item.animation.alpha = alpha

        return { items, background }
    }

    private toggle(value: Value) {
        this.isDirty = true

        if (this.values.toggle(value))
            this.onChange?.()
    }

    private reset() {
        this.values.reset()
        this.isDirty = true

        this.onChange?.()
    }

    private updateHover(mouse: Point | null, now: DOMHighResTimeStamp) {
        const progress = this.motion.getProgress(now)

        const targets = this.entries.map((entry): [string, boolean] => {
            const { x, y, width } = this.motion.getCurrent(entry, progress)

            return [entry.value.id, contains({ x, y, width, height: ITEM_HEIGHT }, mouse)]
        })

        if (this.button)
            targets.push([RESET_KEY, contains(this.button, mouse)])

        return this.hover.update(targets, now)
    }

    private updateBackgrounds() {
        for (const [key, item] of this.backgrounds)
            item.color = Theme.hoverBackground(this.hover.value(key))
    }
}

export default Legend