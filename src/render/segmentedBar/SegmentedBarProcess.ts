import SegmentedBarData from '@/types/data/SegmentedBarData'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import Sector from '@/types/Sector'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import RectangleDimensions from '@/types/RectangleDimensions'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { luminance, withAlpha } from '@/helpers/Color'
import { clamp } from '@/helpers/Geometry'
import { sum } from '@/helpers/Collections'
import ChartProcess from '@/render/ChartProcess'
import Theme from '@/Theme'
import * as SegmentedBarLayout from '@/render/segmentedBar/SegmentedBarLayout'
import * as SegmentedBarParts from '@/render/segmentedBar/SegmentedBarParts'
import { Part, PartsLayout } from '@/render/segmentedBar/SegmentedBarParts'
import {
    LABEL_COLOR_ON_DARK,
    LABEL_COLOR_ON_LIGHT,
    LABEL_FONT_SIZE,
    LABEL_MAX_SHARE,
    LIGHT_LUMINANCE,
    MIN_PART_WIDTH,
    PADDING_X,
    PART_FONT_SIZE,
    PART_PADDING,
    PERCENT_SCALE,
    STOP_LAYER,
    STOP_OUTLINE,
    STOP_OVERFLOW,
    STOP_RADIUS,
    STOP_WIDTH,
    TRACK_ALPHA
} from '@/render/segmentedBar/SegmentedBarConstants'

export default class SegmentedBarProcess extends ChartProcess<SegmentedBarData> {
    private readonly total: number

    private readonly isPercentageMode: boolean

    private readonly bar: RectangleDimensions

    private readonly partsLayout: PartsLayout

    constructor(data: SegmentedBarData, pixel: Point, settings: ProcessSettings) {
        super(data, pixel, settings)

        const positiveValues = data.values.filter(value => value.value > 0)

        this.total = sum(positiveValues, value => value.value)
        this.isPercentageMode = !!data.percentageMode
        this.bar = SegmentedBarLayout.getBarBox(this.units, data.leftLabel, data.rightLabel)
        this.partsLayout = SegmentedBarParts.getParts(
            positiveValues,
            this.bar,
            SegmentedBarParts.getFullBarValue(positiveValues, data.stops, this.isPercentageMode),
            this.units.x(MIN_PART_WIDTH)
        )
    }

    private get parts() {
        return this.partsLayout.parts
    }

    private get barEnd() {
        return this.bar.x + this.bar.width
    }

    private get barRadius() {
        return this.units.x(this.units.toPxY(this.bar.height) / 2)
    }

    private get hasTrack() {
        return this.parts.length == 0 || (this.isPercentageMode && this.total < PERCENT_SCALE)
    }

    isEmpty() {
        return this.parts.length == 0 && this.data.stops.length == 0
    }

    getData() {
        return [
            (items: QueueItemsBuilder) => {
                if (this.hasTrack)
                    this.addTrack(items)

                for (const part of this.parts.filter(part => part.box.x < this.barEnd))
                    this.addPart(items, part)

                for (const stop of this.data.stops)
                    this.addStop(items, stop)

                const padding = this.units.x(PADDING_X)

                this.addLabel(items, 'segmented-bar-left-label', this.data.leftLabel, padding, TextAlignment.Left)
                this.addLabel(
                    items,
                    'segmented-bar-right-label',
                    this.data.rightLabel,
                    COORDS_MAX_X - padding,
                    TextAlignment.Right
                )
            }
        ]
    }

    private addTrack(items: QueueItemsBuilder) {
        items.rect()
             .position(this.bar.x, this.bar.y)
             .size(this.bar.width, this.bar.height)
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .round(this.barRadius)
             .fill()
             .color(withAlpha(Theme.text, TRACK_ALPHA))
             .layer(Layer.Base)
             .key('segmented-bar-track')
    }

    private addPart(items: QueueItemsBuilder, { sector, box }: Part) {
        const key = `segmented-bar-part-${ sector.id }`

        const padding = this.units.x(PART_PADDING)
        const visibleWidth = Math.min(box.width, this.barEnd - box.x)

        items.rect()
             .position(box.x, box.y)
             .size(visibleWidth, box.height)
             .align(HorizontalAlignment.Left, VerticalAlignment.Top)
             .clip(this.bar, this.barRadius)
             .fill()
             .color(sector.color)
             .layer(Layer.Data)
             .key(key)
             .hoverGroup(key)
             .monochrome()
             .interact()
             .contextMenu()
             .tooltipHtml(this.valueTooltip(sector, sector.label, this.getPartValueText(sector)))
             .data(SegmentedBarProcess.getItemData(sector))

        if (sector.label && visibleWidth > padding)
            items.text(sector.label)
                 .position(box.x + padding, box.y + box.height / 2)
                 .size(PART_FONT_SIZE)
                 .align(TextAlignment.Left)
                 .color(luminance(sector.color) > LIGHT_LUMINANCE ? LABEL_COLOR_ON_LIGHT : LABEL_COLOR_ON_DARK)
                 .layer(Layer.Data)
                 .key(`${ key }-label`)
                 .clip(visibleWidth - padding)
    }

    private addStop(items: QueueItemsBuilder, stop: SegmentedBarStop) {
        const key = `segmented-bar-stop-${ stop.id }`

        const width = this.units.x(STOP_WIDTH)
        const height = this.bar.height + this.units.y(STOP_OVERFLOW) * 2
        const outline = { x: this.units.x(STOP_OUTLINE), y: this.units.y(STOP_OUTLINE) }
        const outlinedHalfWidth = width / 2 + outline.x
        const x = clamp(
            SegmentedBarParts.getStopX(stop, this.partsLayout, this.bar),
            this.bar.x + outlinedHalfWidth,
            this.barEnd - outlinedHalfWidth
        )
        const y = this.bar.y + this.bar.height / 2

        items.rect()
             .position(x, y)
             .size(width + outline.x * 2, height + outline.y * 2)
             .round(this.units.x(STOP_RADIUS + STOP_OUTLINE))
             .fill()
             .color(Theme.canvasBackground)
             .layer(STOP_LAYER)
             .key(`${ key }-outline`)

        items.rect()
             .position(x, y)
             .size(width, height)
             .round(this.units.x(STOP_RADIUS))
             .fill()
             .color(stop.color)
             .layer(STOP_LAYER)
             .key(key)
             .hoverGroup(key)
             .monochrome()
             .interact()
             .contextMenu()
             .tooltipHtml(this.valueTooltip(stop, stop.label, this.getStopValueText(stop)))
             .data(SegmentedBarProcess.getItemData(stop))
    }

    private addLabel(
        items: QueueItemsBuilder,
        key: string,
        text: string | undefined,
        x: number,
        alignment: TextAlignment
    ) {
        if (!text)
            return

        items.text(text)
             .position(x, COORDS_MAX_Y / 2)
             .size(LABEL_FONT_SIZE)
             .align(alignment)
             .key(key)
             .clip(COORDS_MAX_X * LABEL_MAX_SHARE)
    }

    private getPartValueText(sector: Sector) {
        return this.isPercentageMode
               ? SegmentedBarProcess.formatPercent(sector.value)
               : this.share(sector.value, sector.value / this.total)
    }

    private getStopValueText(stop: SegmentedBarStop) {
        return stop.isPercent || this.isPercentageMode
               ? SegmentedBarProcess.formatPercent(stop.value)
               : this.formatValue(stop.value)
    }

    private static formatPercent(value: number) {
        return `${ value }%`
    }
}