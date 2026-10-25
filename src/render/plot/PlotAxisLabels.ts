import PlotData from '@/types/data/PlotData'
import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { maxOf } from '@/helpers/Collections'
import { short, stringWidth } from '@/helpers/Text'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import PlotLabelSpacing from '@/render/plot/PlotLabelSpacing'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import {
    AXIS_LABEL_FONT,
    LEFT_GAP,
    TOP_BASELINE_GAP,
    X_LABEL_FONT,
    X_LABEL_SPACING,
    Y_LABEL_HEIGHT
} from '@/render/plot/PlotConstants'

export default class PlotAxisLabels {
    private readonly data: PlotData

    private readonly units: Units

    private readonly layout: PlotLayout

    private readonly seriesGroups: PlotSeriesGroups

    private readonly labelSpacing: PlotLabelSpacing

    constructor(data: PlotData, units: Units, layout: PlotLayout, seriesGroups: PlotSeriesGroups) {
        this.data = data
        this.units = units
        this.layout = layout
        this.seriesGroups = seriesGroups
        this.labelSpacing = new PlotLabelSpacing(units, layout.margin.left)
    }

    addItems(items: QueueItemsBuilder) {
        if (this.seriesGroups.hasBars)
            this.addHorizontalLabels(items)

        if (!this.seriesGroups.isHorizontal)
            this.addVerticalLabels(items)
    }

    private addHorizontalLabels(items: QueueItemsBuilder) {
        const { layout } = this
        const section = layout.horizontal
        const { band, categoryScale, valueScale } = section
        const xValues = valueScale.values
        const positions = xValues.map(value => valueScale.getCoordinate(value))

        this.labelSpacing.getValueLabels(xValues, positions, this.data.shortLabels).forEach((label, i) => {
            if (label)
                this.bottomLabel(items, label, positions[i], band.bottom, `x-label-${ xValues[i] }`)
        })

        const slot = this.units.toPxY(categoryScale.step + categoryScale.gap)
        const every = Math.max(1, Math.ceil(Y_LABEL_HEIGHT / slot))

        layout.getCategoryLabels(section).forEach((category, i) => {
            if (i % every == 0)
                this.leftLabel(items, category, categoryScale.getSlotCenter(i), `y-category-${ i }`)
        })
    }

    private addVerticalLabels(items: QueueItemsBuilder) {
        const { layout } = this
        const section = layout.vertical
        const { band, categoryScale, valueScale } = section

        for (const value of valueScale.values)
            this.leftLabel(
                items,
                short(value, this.data.shortLabels),
                valueScale.getCoordinate(value),
                `y-label-${ value }`
            ).axisValue(value)

        const labels = layout.getCategoryLabels(section)

        const positions = labels.map((_, i) => categoryScale.getSlotCenter(i))

        const slot = this.units.toPxX(categoryScale.step + categoryScale.gap)
        const widest = maxOf(labels, label => stringWidth(label, X_LABEL_FONT))
        const every = this.labelSpacing.getLabelStep(
            labels,
            positions,
            Math.ceil((widest + X_LABEL_SPACING) / slot)
        )

        labels.forEach((label, i) => {
            if (i % every == 0)
                this.bottomLabel(items, label, positions[i], band.bottom, `x-category-${ i }`)
        })
    }

    private leftLabel(items: QueueItemsBuilder, text: string, y: number, key: string) {
        return items.text(text)
                    .position(this.layout.margin.left - this.units.x(LEFT_GAP), y)
                    .size(AXIS_LABEL_FONT)
                    .align(TextAlignment.Right)
                    .key(key)
    }

    private bottomLabel(items: QueueItemsBuilder, text: string, x: number, y: number, key: string) {
        return items.text(text)
                    .position(this.labelSpacing.clampLabel(text, x), y + this.units.y(TOP_BASELINE_GAP))
                    .align(TextAlignment.Center)
                    .baseline(TextBaseline.Top)
                    .size(X_LABEL_FONT)
                    .key(key)
    }
}