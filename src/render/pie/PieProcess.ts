import PieData from '@/types/data/PieData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import QueueArcItemBuilder from '@/builders/QueueArcItemBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, CANVAS_CENTER } from '@/static/constants/Index'
import Point from '@/types/Point'
import { clamp } from '@/helpers/Geometry'
import Angle from '@/helpers/Angle'
import layoutLabels, { LabelPlacement } from '@/render/LabelLayout'
import { stringWidth } from '@/helpers/Text'
import ChartProcess, { ProcessContext } from '@/render/ChartProcess'
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
    TOP_ANGLE
} from '@/render/pie/PieConstants'

export default class PieProcess extends ChartProcess<PieData, PieProcessSettings> {
    private readonly sizing: PieSizing

    private readonly startAngle: number

    private readonly visibleTotal: number

    constructor(data: PieData, pixel: Point, settings: PieProcessSettings, context: ProcessContext) {
        super(data, pixel, settings, context)

        this.sizing = new PieSizing(this.units, this.data.innerRadius)
        this.startAngle = TOP_ANGLE + Angle.toRadians(this.data.startAngle ?? 0)
        this.visibleTotal = PieSlices.getVisibleTotal(this.data.values, this.state.isDisabled)
    }

    getData() {
        const radiansPerUnit = PieSlices.getRadiansPerUnit(this.visibleTotal)

        const slices = PieSlices.getSlices(
            this.getKeyedSectors(radiansPerUnit),
            this.state.isDisabled,
            radiansPerUnit,
            this.startAngle
        )
        const labelPlacements = this.getLabelPlacements(slices)

        return [
            (items: QueueItemsBuilder) => {
                for (const [index, slice] of slices.entries())
                    this.addSlice(items, slice, labelPlacements[index])

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
            this.state.isDisabled,
            sector => sector.value * radiansPerUnit * this.sizing.radius < minArcLength,
            this.theme.other
        )
    }

    private getLabelPlacements(slices: PieSlice[]): LabelPlacement[] {
        if (this.sizing.areLabelsHidden)
            return slices.map(slice => ({ angle: PieSlices.getMiddleAngle(slice), isVisible: false }))

        const placements: LabelPlacement[] = slices.map(slice => ({
            angle: PieSlices.getMiddleAngle(slice),
            isVisible: this.state.isDisabled(slice.sector) || this.hasVisibleValue(slice.sector)
        }))

        const visibleSliceIndexes = slices.flatMap(
            (slice, sliceIndex) => this.hasVisibleValue(slice.sector) ? [sliceIndex] : []
        )

        const layoutPlacements = layoutLabels(
            visibleSliceIndexes.map(sliceIndex => {
                const sector = slices[sliceIndex].sector

                return {
                    angle: placements[sliceIndex].angle,
                    value: sector.value,
                    halfWidth: stringWidth(this.getLabelText(sector), LABEL_FONT_SIZE) / 2,
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

        const fontSize = this.getFittingFontSizeInRing(
            title,
            this.sizing,
            INNER_TITLE_WIDTH_RATIO,
            INNER_TITLE_FONT_SIZE
        )

        if (fontSize < INNER_TITLE_MIN_FONT_SIZE)
            return

        items.text(title)
             .position(CANVAS_CENTER.x, CANVAS_CENTER.y)
             .size(fontSize)
             .align(TextAlignment.Center)
             .key('inner-title')
             .init(AnimationTiming.pieInit, 0, true)
    }

    private addSlice(items: QueueItemsBuilder, slice: PieSlice, labelPlacement: LabelPlacement) {
        const isDisabled = this.state.isDisabled(slice.sector)
        const arc = this.addArc(items, slice, isDisabled)
        const leader = this.addLeader(items, slice, arc, labelPlacement)
        const label = labelPlacement.isVisible ? this.addLabel(items, slice, arc, labelPlacement) : null

        if (label)
            leader.target(label)

        if (isDisabled)
            for (const builder of [arc, leader, label])
                builder?.ghost()
    }

    private addArc(
        items: QueueItemsBuilder,
        { sector, key, groupedSectors, startAngle, angle }: PieSlice,
        isDisabled: boolean
    ) {
        const radius = this.units.x(this.sizing.radius)

        const arc = items.arc()
            .position(CANVAS_CENTER.x, CANVAS_CENTER.y)
            .startAngle(startAngle)
            .endAngle(startAngle + angle)
            .radius(radius)
            .innerRadius(radius * this.sizing.innerRadiusRatio)
            .gap(SECTOR_GAP)
            .cornerRadius(SECTOR_CORNER_RADIUS)
            .pull(this.state.pinned.has(sector) && !isDisabled ? this.units.x(PINNED_SECTOR_OFFSET) : 0)
            .grow(this.startAngle)
            .fill()
            .gradient()
            .color(sector.color)
            .key(`sector-${ key }`)
            .init(AnimationTiming.pieInit)
            .interact()
            .tooltip(this.getTooltipText(sector, groupedSectors))
            .data(sector.data)
            .contextMenu()

        if (!isDisabled && !groupedSectors)
            arc.focusable().onClick(() => {
                this.state.pinned.toggle(sector)
                this.onChange?.()
            })

        return arc
    }

    private addLeader(
        items: QueueItemsBuilder,
        slice: PieSlice,
        arc: QueueArcItemBuilder,
        labelPlacement: LabelPlacement
    ) {
        const labelAngleOffset = Angle.normalize(labelPlacement.angle - PieSlices.getMiddleAngle(slice))
        const leaderAnchorRange = slice.angle / 2 - Math.min(slice.angle / 2, LEADER_ANCHOR_INSET_ANGLE)

        return items.leaderLine(arc)
            .gap(LEADER_GAP)
            .length(LEADER_LENGTH)
            .offset(labelAngleOffset)
            .anchor(clamp(labelAngleOffset, -leaderAnchorRange, leaderAnchorRange))
            .key(`sector-leader-${ slice.key }`)
    }

    private addLabel(
        items: QueueItemsBuilder,
        { sector, key }: PieSlice,
        arc: QueueArcItemBuilder,
        labelPlacement: LabelPlacement
    ) {
        const labelOrbit = {
            ...CANVAS_CENTER,
            radiusX: this.units.x(this.sizing.labelDistance),
            radiusY: this.units.y(this.sizing.labelDistance)
        }

        return items.text(this.getLabelText(sector))
            .orbit(labelPlacement.angle, labelOrbit)
            .size(LABEL_FONT_SIZE)
            .follow(arc.shape)
            .key(`sector-label-${ key }`)
            .init(AnimationTiming.pieLabelInit, AnimationTiming.pieInit, true)
    }

    private getLabelText(sector: Sector) {
        if (this.state.pinned.has(sector) && this.hasVisibleValue(sector))
            return `${ sector.label }: ${ this.getValueWithPercentText(sector.value) }`

        return this.data.labelPercent && this.hasVisibleValue(sector)
               ? `${ sector.label } ${ this.percent(sector.value / this.visibleTotal) }`
               : sector.label ?? ''
    }

    private getTooltipText(sector: Sector, groupedSectors: Sector[] | undefined) {
        const rows = [sector.label, this.getValueWithPercentText(sector.value)]

        for (const groupedSector of groupedSectors ?? [])
            rows.push(`${ groupedSector.label }: ${ this.getValueWithPercentText(groupedSector.value) }`)

        return this.tooltip(...rows)
    }

    private hasVisibleValue(sector: Sector) {
        return PieSlices.hasVisibleValue(sector, this.state.isDisabled)
    }

    private getValueWithPercentText(value: number) {
        return this.share(value, this.visibleTotal === 0 ? 0 : value / this.visibleTotal)
    }
}