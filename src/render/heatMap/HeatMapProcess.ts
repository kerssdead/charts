import HeatMapData, { isPointData } from '@/types/data/HeatMapData'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import ChartProcess from '@/render/ChartProcess'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import * as HeatMapLayout from '@/render/heatMap/HeatMapLayout'
import { Extent } from '@/render/heatMap/HeatMapLayout'
import { getImageExtent } from '@/render/heatMap/HeatMapImage'
import { getExtent, getGrid } from '@/render/heatMap/HeatMapGrid'
import { getField } from '@/render/heatMap/HeatMapField'
import { createColors, createLut, createRamp } from '@/render/heatMap/HeatMapRamp'
import { getAxisAction } from '@/render/heatMap/HeatMapAxisItems'
import { getScaleAction } from '@/render/heatMap/HeatMapScaleItems'
import HeatMapCellItems from '@/render/heatMap/HeatMapCellItems'
import HeatMapFieldItem from '@/render/heatMap/HeatMapFieldItem'
import { AXIS_FONT } from '@/render/heatMap/HeatMapConstants'

type Layout = {
    area: RectangleDimensions
    xEdges: number[]
    yEdges: number[]
}

type Content = {
    columns: number
    rows: number
    extent: Extent | null
    min: number
    max: number
    getActions: (layout: Layout) => QueueAction[]
}

export default class HeatMapProcess extends ChartProcess<HeatMapData> {
    private readonly ramp = createRamp(this.data, this.theme.canvasBackground)

    private readonly colors = createColors(this.ramp)

    private readonly lut = createLut(this.colors)

    private readonly cellItems = new HeatMapCellItems({
        units: this.units,
        colors: this.colors,
        textColor: this.theme.text,
        hasImage: !!this.data.image,
        formatValue: value => this.formatValue(value),
        tooltip: (...rows) => this.tooltip(...rows)
    })

    private readonly fieldItem = new HeatMapFieldItem({
        units: this.units,
        lut: this.lut,
        isAlive: this.data.alive,
        formatValue: value => this.formatValue(value),
        tooltip: (...rows) => this.tooltip(...rows)
    })

    isEmpty() {
        return this.data.values.length === 0
    }

    getData() {
        const imageExtent = this.getImageExtent()

        if (this.isWaitingForImage(imageExtent))
            return []

        const content = this.getContent(imageExtent)
        const height = this.units.toPxY(COORDS_MAX_Y)
        const layout = this.getLayout(content, height)
        const actions = content.getActions(layout)

        if (this.data.image)
            actions.unshift(this.getImageAction(this.data.image, layout.area))

        if (this.hasAxes)
            actions.push(getAxisAction(this.data, { units: this.units, ...layout }))

        actions.push(getScaleAction({
            units: this.units,
            area: layout.area,
            height,
            minText: this.formatValue(content.min),
            maxText: this.formatValue(content.max),
            lut: this.lut
        }))

        return actions
    }

    private get hasAxes() {
        return !isPointData(this.data) && !this.data.disableAxes
    }

    private isWaitingForImage(imageExtent: Extent | null) {
        return !!this.data.image && !imageExtent && !getExtent(this.data)
    }

    private getContent(imageExtent: Extent | null): Content {
        if (this.data.smooth) {
            const field = getField(this.data, imageExtent)

            return { ...field, getActions: ({ area }) => [this.fieldItem.getAction(field, area)] }
        }

        const grid = getGrid(this.data, imageExtent)

        return { ...grid, getActions: layout => this.cellItems.getActions(grid, layout) }
    }

    private getLayout({ columns, rows, extent }: Content, height: number): Layout {
        const margins = HeatMapLayout.getMargins(this.hasAxes ? { ...this.data, font: AXIS_FONT } : null)
        const bounds = HeatMapLayout.getBounds(this.units.toPxX(COORDS_MAX_X), height, margins)
        const area = HeatMapLayout.getArea(bounds, extent)

        return {
            area,
            xEdges: HeatMapLayout.getEdges(columns, area.x, area.width),
            yEdges: HeatMapLayout.getEdges(rows, area.y, area.height)
        }
    }

    private getImageExtent() {
        const { image } = this.data

        if (!image)
            return null

        return getImageExtent({
            url: image,
            crossOrigin: this.settings.imageCrossOrigin,
            owner: this.state,
            onLoad: this.onChange
        })
    }

    private getImageAction(url: string, area: RectangleDimensions): QueueAction {
        const box = HeatMapLayout.toUnits(this.units, area)

        return (items: QueueItemsBuilder) => {
            items.image(url)
                 .box(box.x, box.y, box.width, box.height)
                 .crossOrigin(this.settings.imageCrossOrigin)
                 .init(AnimationTiming.heatMapInit, 0, true)
                 .key('heat-image')
        }
    }
}