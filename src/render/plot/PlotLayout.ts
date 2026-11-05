import PlotData from '@/types/data/PlotData'
import PlotPoint from '@/types/PlotPoint'
import Paddings from '@/types/Paddings'
import Units from '@/helpers/Units'
import Formatter from '@/helpers/Formatter'
import { short } from '@/helpers/Text'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { PlotOrientation, PlotScaleType } from '@/static/Enums'
import PlotSection from '@/render/plot/PlotSection'
import PlotSeriesGroups from '@/render/plot/PlotSeriesGroups'
import PlotContinuousAxis from '@/render/plot/PlotContinuousAxis'
import { getAxisValues } from '@/render/plot/PlotAxisValues'
import { getSlots } from '@/render/plot/PlotSlots'
import { getMargin } from '@/render/plot/PlotMargins'
import { BAND_SPACING, BAR_BAND_RATIO, X_LABEL_HEIGHT } from '@/render/plot/PlotConstants'

export default class PlotLayout {
    readonly yMax: number | undefined

    readonly margin: Paddings

    readonly vertical: PlotSection

    readonly horizontal: PlotSection

    private readonly data: PlotData

    private readonly units: Units

    private readonly seriesGroups: PlotSeriesGroups

    constructor(data: PlotData, units: Units, seriesGroups: PlotSeriesGroups) {
        this.data = data
        this.units = units
        this.seriesGroups = seriesGroups

        this.yMax = data.yMax == 0 ? undefined : data.yMax

        const verticalSlots = getSlots(seriesGroups.verticalSeries, data.xType)
        const horizontalSlots = getSlots(seriesGroups.barSeries, data.xType)

        const xScale = data.xScale ?? PlotScaleType.Category
        const yScale = data.yScale ?? PlotScaleType.Linear
        const verticalAxis = PlotContinuousAxis.create(verticalSlots, data.xType, xScale)
        const horizontalAxis = PlotContinuousAxis.create(horizontalSlots, data.xType, xScale)

        const { yAxisValues, xAxisValues } = getAxisValues(
            seriesGroups.enabledSeries,
            this.yMax,
            seriesGroups.hasOnlyBarSeries,
            yScale
        )

        this.margin = getMargin(
            units,
            data.simple,
            this.leftTitle,
            this.bottomTitle,
            this.getLeftLabels(horizontalAxis?.ticks ?? horizontalSlots.values, yAxisValues)
        )

        const left = this.margin.left
        const width = COORDS_MAX_X - this.margin.left - this.margin.right
        const top = this.margin.top
        const bottom = COORDS_MAX_Y - this.margin.bottom
        const barBottom = this.isMixed ? top + (bottom - top - this.bandGap) * BAR_BAND_RATIO : bottom

        this.horizontal = new PlotSection(
            PlotOrientation.Horizontal,
            horizontalSlots,
            xAxisValues,
            { top, bottom: barBottom },
            left,
            width,
            horizontalAxis,
            yScale
        )

        this.vertical = new PlotSection(
            PlotOrientation.Vertical,
            verticalSlots,
            yAxisValues,
            { top: this.isMixed ? barBottom + this.bandGap : top, bottom },
            left,
            width,
            verticalAxis,
            yScale
        )
    }

    get leftTitle() {
        return this.seriesGroups.isHorizontal ? this.data.xTitle : this.data.yTitle
    }

    get bottomTitle() {
        return this.seriesGroups.isHorizontal ? this.data.yTitle : this.data.xTitle
    }

    getCategoryLabels(section: PlotSection) {
        return this.formatCategories(section.categoryScale.labelValues)
    }

    formatX(x: PlotPoint['x']) {
        return Formatter.axis(x, this.data.xType)
    }

    capToYMax(y: number) {
        return this.yMax == undefined ? y : Math.min(y, this.yMax)
    }

    private get isMixed() {
        return this.seriesGroups.rendersBars && !this.seriesGroups.isHorizontal
    }

    private get bandGap() {
        return this.units.y(X_LABEL_HEIGHT + BAND_SPACING)
    }

    private formatCategories(values: PlotPoint['x'][]) {
        return values.map(x => this.formatX(x))
    }

    private getLeftLabels(horizontalCategories: PlotPoint['x'][], yAxisValues: number[]) {
        return [
            ...(this.seriesGroups.rendersBars ? this.formatCategories(horizontalCategories) : []),
            ...(this.seriesGroups.isHorizontal ? [] : yAxisValues.map(value => short(value, this.data.shortLabels)))
        ]
    }
}