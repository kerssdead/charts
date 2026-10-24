import GaugeData from '@/types/data/GaugeData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, COORDS_MAX_X, Layer } from '@/static/constants/Index'
import Point from '@/types/Point'
import ProcessSettings from '@/types/ProcessSettings'
import Theme from '@/Theme'
import { withAlpha } from '@/helpers/Color'
import { clamp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import ChartProcess from '@/render/ChartProcess'
import { TextAlignment } from '@/static/Enums'
import GaugeSizing from '@/render/gauge/GaugeSizing'
import * as GaugeSteps from '@/render/gauge/GaugeSteps'
import { GaugeStep } from '@/render/gauge/GaugeSteps'
import * as GaugeLegend from '@/render/gauge/GaugeLegend'
import { LegendItem } from '@/render/gauge/GaugeLegend'
import * as GaugeValueLabels from '@/render/gauge/GaugeValueLabels'
import {
    CANVAS_PADDING,
    LABEL_FONT_SIZE,
    LABEL_GAP,
    LEGEND_ITEM_SPACING,
    MARKER_RADIUS,
    MARKER_TEXT_GAP,
    RANGE_FONT_SIZE,
    RING_CORNER_RADIUS,
    RING_GAP,
    START_ANGLE,
    SWEEP_ANGLE,
    TRACK_ALPHA,
    VALUE_FONT_SIZE,
    VALUE_MIN_FONT_SIZE,
    VALUE_WIDTH_RATIO
} from '@/render/gauge/GaugeConstants'

export default class GaugeProcess extends ChartProcess<GaugeData> {
    private readonly enabledSectors: Sector[]

    private readonly legendLines: LegendItem[][]

    private readonly steps: GaugeStep[]

    private readonly sizing: GaugeSizing

    constructor(data: GaugeData, pixel: Point, settings: ProcessSettings) {
        super(data, pixel, settings)

        const formatValue = (value: number) => this.formatValue(value)
        const legendAvailableWidth = this.units.toPxX(COORDS_MAX_X) - this.units.toPxX(CANVAS_PADDING) * 2

        this.enabledSectors = data.values.filter(sector => !sector.disabled)
        // todo: legend items are measured even for a single value with no legend; measure before skipping it
        this.legendLines = GaugeLegend.getLegendLines(
            GaugeLegend.getLegendItems(this.enabledSectors, formatValue),
            legendAvailableWidth
        )
        this.steps = this.data.disableStepLabels ? [] : GaugeSteps.getSteps(this.min, this.max, formatValue)
        this.sizing = new GaugeSizing(
            this.units,
            this.data.innerRadius,
            this.steps,
            this.labelRowCount,
            this.enabledSectors.length
        )
    }

    private get min() {
        return this.data.min ?? 0
    }

    private get max() {
        return this.data.max ?? 100
    }

    private get hasSingleValue() {
        return this.enabledSectors.length == 1
    }

    private get labelRowCount() {
        return this.hasSingleValue ? 2 : this.legendLines.length + 1
    }

    isEmpty() {
        return !this.enabledSectors.length
    }

    getData() {
        if (this.isEmpty() || this.sizing.radius <= 0)
            return []

        return [
            (items: QueueItemsBuilder) => {
                for (const [ringIndex, sector] of this.enabledSectors.entries()) {
                    this.addTrack(items, ringIndex)
                    this.addRing(items, sector, ringIndex)
                }

                this.addLabels(items)
            }
        ]
    }

    private getValueRatio(value: number) {
        const range = this.max - this.min

        return range == 0 || !Number.isFinite(value) ? 0 : clamp((value - this.min) / range, 0, 1)
    }

    private addRingShape(items: QueueItemsBuilder, ringIndex: number, endAngle: number) {
        const radius = this.sizing.radius - this.sizing.ringThickness * ringIndex

        return items.arc()
                    .position(this.sizing.centerInCoords.x, this.sizing.centerInCoords.y)
                    .startAngle(START_ANGLE)
                    .endAngle(endAngle)
                    .radius(this.units.x(radius))
                    .innerRadius(this.units.x(radius - this.sizing.ringThickness))
                    .gap(RING_GAP)
                    .cornerRadius(RING_CORNER_RADIUS)
                    .fill()
                    .gradient()
    }

    private addTrack(items: QueueItemsBuilder, ringIndex: number) {
        if (!this.data.enableTrack)
            return

        this.addRingShape(items, ringIndex, START_ANGLE + SWEEP_ANGLE)
            .color(withAlpha(Theme.text, TRACK_ALPHA))
            .layer(Layer.Base)
            .key(`gauge-track-${ ringIndex }`)
            .init(AnimationTiming.gaugeInit, 0, true)
    }

    private addRing(items: QueueItemsBuilder, sector: Sector, ringIndex: number) {
        // todo: getValueRatio() runs twice per ring (here and in getTooltipText); measure before caching it
        this.addRingShape(items, ringIndex, START_ANGLE + SWEEP_ANGLE * this.getValueRatio(sector.value))
            .grow(START_ANGLE)
            .color(sector.color)
            .layer(Layer.Data)
            .key(`gauge-value-${ ringIndex }`)
            .hoverGroup(`gauge-value-${ ringIndex }`)
            .interact()
            .init(AnimationTiming.gaugeInit)
            .tooltip(this.getTooltipText(sector))
            .data(sector.data)
            .contextMenu()
    }

    private addLabels(items: QueueItemsBuilder) {
        const centerY = this.sizing.centerInCoords.y
        const labelRowYs = Array.from(
            { length: this.labelRowCount },
            (_, rowIndex) => centerY + this.units.y(LABEL_GAP + LABEL_FONT_SIZE * (rowIndex + .5))
        )

        this.addRangeLabels(items, labelRowYs[0])
        this.addStepLabels(items)

        if (this.hasSingleValue)
            this.addValueLabels(items, labelRowYs)
        else
            this.addLegend(items, labelRowYs.slice(1))
    }

    private addRangeLabels(items: QueueItemsBuilder, y: number) {
        const { x } = this.sizing.centerInCoords
        const ringMiddleRadius = this.units.x(this.sizing.ringMiddleRadius)

        this.addText(items, 'gauge-min', this.formatValue(this.min), x - ringMiddleRadius, y, RANGE_FONT_SIZE)
        this.addText(items, 'gauge-max', this.formatValue(this.max), x + ringMiddleRadius, y, RANGE_FONT_SIZE)
    }

    private addStepLabels(items: QueueItemsBuilder) {
        const stepOrbit = {
            ...this.sizing.centerInCoords,
            radiusX: this.units.x(this.sizing.radius + LABEL_GAP),
            radiusY: this.units.y(this.sizing.radius + LABEL_GAP)
        }

        for (const [stepIndex, step] of this.steps.entries())
            items.text(step.text)
                 .orbit(step.angle, stepOrbit)
                 .size(RANGE_FONT_SIZE)
                 .key(`gauge-step-${ stepIndex }`)
                 .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
    }

    private addLegend(items: QueueItemsBuilder, lineYs: number[]) {
        for (const [lineIndex, legendLine] of this.legendLines.entries()) {
            let itemLeft = GaugeLegend.getLineLeft(legendLine, this.units.toPxX(COORDS_MAX_X))

            for (const legendItem of legendLine) {
                const textCenterX = itemLeft + MARKER_RADIUS + MARKER_TEXT_GAP
                                    + (legendItem.width - MARKER_RADIUS - MARKER_TEXT_GAP) / 2

                this.addMarker(items, legendItem, this.units.x(itemLeft + MARKER_RADIUS), lineYs[lineIndex])
                this.addText(
                    items,
                    legendItem.key,
                    legendItem.text,
                    this.units.x(textCenterX),
                    lineYs[lineIndex],
                    LABEL_FONT_SIZE
                )

                itemLeft += legendItem.width + LEGEND_ITEM_SPACING
            }
        }
    }

    private addValueLabels(items: QueueItemsBuilder, labelRowYs: number[]) {
        const { x, y } = this.sizing.centerInCoords

        const singleSector = this.enabledSectors[0]
        const valueText = this.formatValue(singleSector.value)

        // todo: min/max are formatted and measured again on every getData(); measure before caching them
        const rangeLabelWidth = Math.max(
            stringWidth(this.formatValue(this.min), RANGE_FONT_SIZE),
            stringWidth(this.formatValue(this.max), RANGE_FONT_SIZE)
        )
        const widthBetweenRangeLabels = (this.sizing.ringMiddleRadius - rangeLabelWidth / 2 - LABEL_GAP * 2) * 2

        const innerWidth = this.sizing.radius * this.sizing.innerRadiusRatio * 2 * VALUE_WIDTH_RATIO
        const valueFontSize = this.getFittingFontSize(valueText, innerWidth, VALUE_FONT_SIZE)
        const isValueInside = valueFontSize >= VALUE_MIN_FONT_SIZE

        if (isValueInside)
            this.addText(
                items,
                'gauge-value-label',
                valueText,
                x,
                y - this.units.y(valueFontSize / 2),
                valueFontSize
            )

        const labelsBelow = [
            ...(isValueInside ? [] : [{ key: 'gauge-value-label', text: valueText }]),
            { key: 'gauge-label', text: singleSector.label }
        ].filter(label => label.text)

        const labelsInRows = GaugeValueLabels.getLabelsInRows(
            labelsBelow,
            widthBetweenRangeLabels,
            labelRowYs.length
        )

        for (const label of labelsInRows)
            this.addText(items, label.key, label.text, x, labelRowYs[label.rowIndex], LABEL_FONT_SIZE)
    }

    private addMarker(items: QueueItemsBuilder, legendItem: LegendItem, x: number, y: number) {
        items.arc()
             .position(x, y)
             .radius(this.units.x(MARKER_RADIUS))
             .fill()
             .color(legendItem.color)
             .key(`${ legendItem.key }-marker`)
             .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
    }

    private addText(
        items: QueueItemsBuilder,
        key: string,
        text: string,
        x: number,
        y: number,
        fontSize: number
    ) {
        items.text(text)
             .position(x, y)
             .size(fontSize)
             .align(TextAlignment.Center)
             .key(key)
             .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
    }

    private getTooltipText(sector: Sector) {
        return this.tooltip(sector.label, this.share(sector.value, this.getValueRatio(sector.value)))
    }
}