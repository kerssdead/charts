import SegmentedBarData from '@/types/data/SegmentedBarData'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import Sector from '@/types/Sector'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { luminance, withAlpha } from '@/helpers/Color'
import { clamp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import { sum } from '@/helpers/Collections'
import ChartProcess from '@/render/ChartProcess'
import CustomTooltip from '@/renderer/CustomTooltip'
import Theme from '@/Theme'
import ItemData from '@/types/ItemData'

const PADDING_X = 7

const PADDING_Y = 5

const LABEL_FONT = 12

const LABEL_GAP = 12

const LABEL_MAX_SHARE = .2

const PART_FONT = 12

const PART_PADDING = 6

const LIGHT_LUMINANCE = .5

const MIN_PART_WIDTH = 4

const STOP_WIDTH = 6

const STOP_OVERFLOW = 3

const STOP_RADIUS = 3

const STOP_OUTLINE = 2

const PERCENT_SCALE = 100

const TRACK_ALPHA = .15

const LINE_BREAK = /<br\s*\/?>/gi

type Part = {
    sector: Sector
    box: RectangleDimensions
}

export default class SegmentedBarProcess extends ChartProcess<SegmentedBarData> {
    private readonly total: number

    private readonly isPercent: boolean

    private readonly scale: number

    private unit: number = 0

    private readonly padding: number

    private readonly bar: RectangleDimensions

    private readonly parts: Part[]

    constructor(data: SegmentedBarData, pixel: Point, valuePostfix: string | undefined) {
        super(data, pixel, valuePostfix)

        const values = data.values.filter(value => value.value > 0)

        this.total = sum(values, value => value.value)
        this.isPercent = !!data.percentageMode
        this.scale = this.isPercent ? PERCENT_SCALE : this.total || this.getStopsScale()
        this.padding = this.units.x(PADDING_X)
        this.bar = this.getBar()
        this.parts = this.getParts(values)
    }

    isEmpty() {
        return this.parts.length == 0 && this.data.stops.length == 0
    }

    getData(): QueueAction[] {
        return [
            this.getTrack(),
            ...this.parts.filter(part => part.box.x < this.barEnd).map(part => this.getPart(part)),
            ...this.data.stops.map(stop => this.getStop(stop)),
            this.getLabel('segmented-bar-left-label', this.data.leftLabel, this.padding, TextAlignment.Left),
            this.getLabel('segmented-bar-right-label', this.data.rightLabel, COORDS_MAX_X - this.padding, TextAlignment.Right)
        ]
    }

    private get barEnd() {
        return this.bar.x + this.bar.width
    }

    private get radius() {
        return this.units.x(this.units.toPxY(this.bar.height) / 2)
    }

    private getBar(): RectangleDimensions {
        const left = this.padding + this.getLabelSpace(this.data.leftLabel)
        const right = this.padding + this.getLabelSpace(this.data.rightLabel)
        const top = this.units.y(PADDING_Y + STOP_OVERFLOW)

        return {
            x: left,
            y: top,
            width: COORDS_MAX_X - left - right,
            height: COORDS_MAX_Y - top * 2
        }
    }

    private getStopsScale() {
        return Math.max(...this.data.stops.filter(stop => !stop.isPercent).map(stop => stop.value), 0) || 1
    }

    private getLabelSpace(text: string | undefined) {
        if (!text)
            return 0

        return Math.min(this.units.x(stringWidth(text, LABEL_FONT)), COORDS_MAX_X * LABEL_MAX_SHARE) + this.units.x(LABEL_GAP)
    }

    private getParts(values: Sector[]): Part[] {
        const min = this.units.x(MIN_PART_WIDTH)

        const small = values.filter(value => value.value / this.scale * this.bar.width < min)

        this.unit = (this.bar.width - small.length * min) / (this.scale - sum(small, value => value.value))

        let x = this.bar.x

        return values.map(sector => {
            const width = small.includes(sector) ? min : sector.value * this.unit
            const box = { x, y: this.bar.y, width, height: this.bar.height }

            x += width

            return { sector, box }
        })
    }

    private getX(stop: SegmentedBarStop) {
        if (stop.isPercent)
            return this.bar.x + this.bar.width * clamp(stop.value / 100, 0, 1)

        let rest = Math.max(stop.value, 0)

        for (const { sector, box } of this.parts) {
            if (rest <= sector.value)
                return box.x + box.width * rest / sector.value

            rest -= sector.value
        }

        const last = this.parts[this.parts.length - 1]

        return (last ? last.box.x + last.box.width : this.bar.x) + rest * this.unit
    }

    private getTrack(): QueueAction {
        if (this.parts.length > 0 && (!this.isPercent || this.total >= PERCENT_SCALE))
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.rect()
                 .position(this.bar.x, this.bar.y)
                 .size(this.bar.width, this.bar.height)
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .round(this.radius)
                 .fill()
                 .color(withAlpha(Theme.text, TRACK_ALPHA))
                 .layer(Layer.Base)
                 .key('segmented-bar-track')
        }
    }

    private getPart({ sector, box }: Part): QueueAction {
        const key = `segmented-bar-part-${ sector.id }`

        const padding = this.units.x(PART_PADDING)
        const width = Math.min(box.width, this.barEnd - box.x)
        const value = this.isPercent ? SegmentedBarProcess.formatPercent(sector) : this.share(sector.value, sector.value / this.total)

        return (items: QueueItemsBuilder) => {
            items.rect()
                 .position(box.x, box.y)
                 .size(width, box.height)
                 .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                 .clip(this.bar, this.radius)
                 .fill()
                 .color(sector.color)
                 .layer(Layer.Data)
                 .key(key)
                 .hoverGroup(key)
                 .monochrome()
                 .interact()
                 .contextMenu()
                 .tooltipHtml(this.getTooltip(sector, value))
                 .data(SegmentedBarProcess.getItemData(sector))

            if (sector.label)
                items.text(sector.label)
                     .position(box.x + padding, box.y + box.height / 2)
                     .size(PART_FONT)
                     .align(TextAlignment.Left)
                     .color(luminance(sector.color) > LIGHT_LUMINANCE ? '#000000' : '#ffffff')
                     .layer(Layer.Data)
                     .key(`${ key }-label`)
                     .clip(width - padding)
        }
    }

    private getStop(stop: SegmentedBarStop): QueueAction {
        const key = `segmented-bar-stop-${ stop.id }`

        const width = this.units.x(STOP_WIDTH)
        const height = this.bar.height + this.units.y(STOP_OVERFLOW) * 2
        const x = clamp(this.getX(stop), this.bar.x + width / 2, this.bar.x + this.bar.width - width / 2)
        const y = this.bar.y + this.bar.height / 2
        const outline = { x: this.units.x(STOP_OUTLINE), y: this.units.y(STOP_OUTLINE) }

        const value = stop.isPercent || this.isPercent ? SegmentedBarProcess.formatPercent(stop) : this.formatValue(stop.value)

        return (items: QueueItemsBuilder) => {
            items.rect()
                 .position(x, y)
                 .size(width + outline.x * 2, height + outline.y * 2)
                 .round(this.units.x(STOP_RADIUS + STOP_OUTLINE))
                 .fill()
                 .color(Theme.canvasBackground)
                 .layer(Layer.Data + 1)
                 .key(`${ key }-outline`)

            items.rect()
                 .position(x, y)
                 .size(width, height)
                 .round(this.units.x(STOP_RADIUS))
                 .fill()
                 .color(stop.color)
                 .layer(Layer.Data + 1)
                 .key(key)
                 .hoverGroup(key)
                 .monochrome()
                 .interact()
                 .contextMenu()
                 .tooltipHtml(this.getTooltip(stop, value))
                 .data(SegmentedBarProcess.getItemData(stop))
        }
    }

    private static formatPercent(value: Sector) {
        return `${ value.value }%`
    }

    private getTooltip(sector: Sector, value: string) {
        const data = sector.data as ItemData | string | undefined
        const text = typeof data == 'string' ? data.replace(LINE_BREAK, '\n') : undefined

        return CustomTooltip.fromText(this.tooltip(sector.label, text, value))
    }

    private static getItemData(sector: Sector) {
        return typeof sector.data == 'object' ? sector.data : undefined
    }

    private getLabel(key: string, text: string | undefined, x: number, alignment: TextAlignment): QueueAction {
        if (!text)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.text(text)
                 .position(x, COORDS_MAX_Y / 2)
                 .size(LABEL_FONT)
                 .align(alignment)
                 .key(key)
                 .clip(COORDS_MAX_X * LABEL_MAX_SHARE)
        }
    }
}
