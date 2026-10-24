import PieData from '@/types/data/PieData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, CANVAS_CENTER } from '@/static/constants/Index'
import Point from '@/types/Point'
import { clamp, normalizeAngle } from '@/helpers/Geometry'
import layoutLabels, { LabelPlacement } from '@/render/LabelLayout'
import { stringWidth } from '@/helpers/Text'
import ChartProcess from '@/render/ChartProcess'
import { TextAlignment } from '@/static/Enums'
import PieSizing from '@/render/pie/PieSizing'
import PieProcessSettings from '@/render/pie/PieProcessSettings'
import * as PieSlices from '@/render/pie/PieSlices'
import { PieSlice } from '@/render/pie/PieSlices'
import {
    INNER_TITLE_FONT_SIZE,
    INNER_TITLE_MIN_FONT_SIZE,
    INNER_TITLE_WIDTH_RATIO,
    LABEL_FONT_SIZE,
    LEADER_ANCHOR_INSET_ANGLE,
    LEADER_GAP,
    LEADER_LENGTH,
    MIN_SECTOR_ARC_LENGTH,
    PINNED_SECTOR_OFFSET,
    SECTOR_CORNER_RADIUS,
    SECTOR_GAP,
    START_ANGLE
} from '@/render/pie/PieConstants'

export default class PieProcess extends ChartProcess<PieData, PieProcessSettings> {
    private readonly sizing: PieSizing

    constructor(data: PieData, pixel: Point, settings: PieProcessSettings) {
        super(data, pixel, settings)

        this.sizing = new PieSizing(this.units, this.data.innerRadius)
    }

    getData() {
        const visibleTotal = PieSlices.getVisibleTotal(this.data.values)
        const radiansPerUnit = PieSlices.getRadiansPerUnit(visibleTotal)

        const slices = PieSlices.getSlices(this.getKeyedSectors(radiansPerUnit), radiansPerUnit)
        const labelPlacements = this.getLabelPlacements(slices, visibleTotal)

        return [
            (items: QueueItemsBuilder) => {
                for (const [index, slice] of slices.entries())
                    this.addSlice(items, slice, labelPlacements[index], visibleTotal)

                this.addInnerTitle(items)
            }
        ]
    }

    private getKeyedSectors(radiansPerUnit: number) {
        if (!this.settings.enableOther)
            return PieSlices.toKeyedSectors(this.data.values)

        const minArcLength = this.units.toPxX(MIN_SECTOR_ARC_LENGTH)

        return PieSlices.getSectorsWithSmallGroupedIntoOther(
            this.data.values,
            sector => sector.value * radiansPerUnit * this.sizing.radius < minArcLength
        )
    }

    private getLabelPlacements(slices: PieSlice[], visibleTotal: number): LabelPlacement[] {
        if (this.sizing.areLabelsHidden)
            return slices.map(slice => ({ angle: PieSlices.getMiddleAngle(slice), isVisible: false }))

        const placements: LabelPlacement[] = slices.map(slice => ({
            angle: PieSlices.getMiddleAngle(slice),
            isVisible: slice.sector.disabled || PieSlices.hasVisibleValue(slice.sector)
        }))

        const visibleSliceIndexes = slices.flatMap(
            (slice, sliceIndex) => PieSlices.hasVisibleValue(slice.sector) ? [sliceIndex] : []
        )

        // todo: getLabelText() runs twice per slice (here and in addSlice); measure before caching it
        const layoutPlacements = layoutLabels(
            visibleSliceIndexes.map(sliceIndex => {
                const sector = slices[sliceIndex].sector

                return {
                    angle: placements[sliceIndex].angle,
                    value: sector.value,
                    halfWidth: stringWidth(this.getLabelText(sector, visibleTotal), LABEL_FONT_SIZE) / 2,
                    halfHeight: LABEL_FONT_SIZE / 2
                }
            }),
            this.sizing.labelDistance,
            this.sizing.labelBounds
        )

        for (const [layoutIndex, sliceIndex] of visibleSliceIndexes.entries())
            placements[sliceIndex] = layoutPlacements[layoutIndex]

        return placements
    }

    private addInnerTitle(items: QueueItemsBuilder) {
        const title = this.data.innerTitle

        if (!title)
            return

        const availableWidth = this.sizing.radius * this.sizing.innerRadiusRatio * 2 * INNER_TITLE_WIDTH_RATIO
        const fontSize = this.getFittingFontSize(title, availableWidth, INNER_TITLE_FONT_SIZE)

        if (fontSize < INNER_TITLE_MIN_FONT_SIZE)
            return

        items.text(title)
             .position(CANVAS_CENTER.x, CANVAS_CENTER.y)
             .size(fontSize)
             .align(TextAlignment.Center)
             .key('inner-title')
             .init(AnimationTiming.pieInit, 0, true)
    }

    private addSlice(
        items: QueueItemsBuilder,
        slice: PieSlice,
        labelPlacement: LabelPlacement,
        visibleTotal: number
    ) {
        const { sector, key, groupedSectors, startAngle, angle } = slice
        const endAngle = startAngle + angle
        const labelAngleOffset = normalizeAngle(labelPlacement.angle - PieSlices.getMiddleAngle(slice))
        const leaderAnchorRange = angle / 2 - Math.min(angle / 2, LEADER_ANCHOR_INSET_ANGLE)

        const radius = this.units.x(this.sizing.radius)
        const innerRadius = radius * this.sizing.innerRadiusRatio

        // todo: labelOrbit is the same for every slice; measure before computing it once
        const labelOrbit = {
            ...CANVAS_CENTER,
            radiusX: this.units.x(this.sizing.labelDistance),
            radiusY: this.units.y(this.sizing.labelDistance)
        }

        const arc = items.arc()
            .position(CANVAS_CENTER.x, CANVAS_CENTER.y)
            .startAngle(startAngle)
            .endAngle(endAngle)
            .radius(radius)
            .innerRadius(innerRadius)
            .gap(SECTOR_GAP)
            .cornerRadius(SECTOR_CORNER_RADIUS)
            .pull(sector.pinned && !sector.disabled ? this.units.x(PINNED_SECTOR_OFFSET) : 0)
            .grow(START_ANGLE)
            .leader(
                LEADER_GAP,
                LEADER_LENGTH,
                labelAngleOffset,
                clamp(labelAngleOffset, -leaderAnchorRange, leaderAnchorRange)
            )
            .fill()
            .gradient()
            .color(sector.color)
            .key(`sector-${ key }`)
            .init(AnimationTiming.pieInit)
            .interact()
            .tooltip(this.getTooltipText(sector, groupedSectors, visibleTotal))
            .data(sector.data)
            .contextMenu()

        if (sector.disabled)
            arc.ghost()
        else if (!groupedSectors)
            arc.onClick(() => {
                sector.pinned = !sector.pinned
                this.onChange?.()
            })

        if (!labelPlacement.isVisible)
            return

        const text = items.text(this.getLabelText(sector, visibleTotal))
            .orbit(labelPlacement.angle, labelOrbit)
            .size(LABEL_FONT_SIZE)
            .follow(arc.shape)
            .key(`sector-label-${ key }`)
            .init(AnimationTiming.pieLabelInit, AnimationTiming.pieInit, true)

        arc.shape.leaderLabel = text.dispose()

        if (sector.disabled)
            text.ghost()
    }

    private getLabelText(sector: Sector, visibleTotal: number) {
        if (sector.pinned && PieSlices.hasVisibleValue(sector))
            return `${ sector.label }: ${ this.getValueWithPercentText(sector.value, visibleTotal) }`

        return this.data.labelPercent && PieSlices.hasVisibleValue(sector)
               ? `${ sector.label } ${ this.percent(sector.value / visibleTotal) }`
               : sector.label
    }

    private getTooltipText(sector: Sector, groupedSectors: Sector[] | undefined, visibleTotal: number) {
        const rows = [sector.label, this.getValueWithPercentText(sector.value, visibleTotal)]

        for (const groupedSector of groupedSectors ?? []) {
            const valueWithPercent = this.getValueWithPercentText(groupedSector.value, visibleTotal)

            rows.push(`${ groupedSector.label }: ${ valueWithPercent }`)
        }

        return this.tooltip(...rows)
    }

    private getValueWithPercentText(value: number, visibleTotal: number) {
        return this.share(value, visibleTotal == 0 ? 0 : value / visibleTotal)
    }
}