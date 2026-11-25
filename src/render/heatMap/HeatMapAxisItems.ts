import HeatMapData from '@/types/data/HeatMapData'
import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import { maxOf } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'
import { TextAlignment, TextBaseline } from '@/static/Enums'
import {
    AXIS_FONT,
    AXIS_LABEL_HEIGHT,
    AXIS_LABEL_SPACING,
    LABEL_GAP,
    PADDING,
    TITLE_FONT
} from '@/render/heatMap/HeatMapConstants'

export type AxisFrame = {
    units: Units
    area: RectangleDimensions
    xEdges: number[]
    yEdges: number[]
}

export function getAxisAction(data: HeatMapData, frame: AxisFrame) {
    return (items: QueueItemsBuilder) => {
        addXLabels(items, data.xLabels, frame)
        addYLabels(items, data.yLabels, frame)

        if (data.xTitle)
            addXTitle(items, data.xTitle, frame)

        if (data.yTitle)
            addYTitle(items, data.yTitle, frame)
    }
}

function addXLabels(items: QueueItemsBuilder, labels: string[], { units, area, xEdges }: AxisFrame) {
    const widest = maxOf(labels, label => stringWidth(label, AXIS_FONT))
    const every = Math.max(1, Math.ceil((widest + AXIS_LABEL_SPACING) / (area.width / labels.length)))

    labels.forEach((label, index) => {
        if (index % every === 0)
            items.text(label)
                 .position(
                     units.x((xEdges[index] + xEdges[index + 1]) / 2),
                     units.y(area.y + area.height + LABEL_GAP)
                 )
                 .align(TextAlignment.Center)
                 .baseline(TextBaseline.Top)
                 .size(AXIS_FONT)
                 .key(`heat-x-label-${ index }`)
    })
}

function addYLabels(items: QueueItemsBuilder, labels: string[], { units, area, yEdges }: AxisFrame) {
    const every = Math.max(1, Math.ceil(AXIS_LABEL_HEIGHT / (area.height / labels.length)))

    labels.forEach((label, index) => {
        if (index % every === 0)
            items.text(label)
                 .position(units.x(area.x - LABEL_GAP), units.y((yEdges[index] + yEdges[index + 1]) / 2))
                 .align(TextAlignment.Right)
                 .size(AXIS_FONT)
                 .key(`heat-y-label-${ index }`)
    })
}

function addXTitle(items: QueueItemsBuilder, title: string, { units, area }: AxisFrame) {
    items.text(title)
         .position(
             units.x(area.x + area.width / 2),
             units.y(area.y + area.height + LABEL_GAP + AXIS_LABEL_HEIGHT + LABEL_GAP)
         )
         .baseline(TextBaseline.Top)
         .size(TITLE_FONT)
         .key('heat-x-title')
}

function addYTitle(items: QueueItemsBuilder, title: string, { units, area }: AxisFrame) {
    items.text(title)
         .position(units.x(PADDING), units.y(area.y + area.height / 2))
         .baseline(TextBaseline.Top)
         .size(TITLE_FONT)
         .rotate(Math.PI * 1.5)
         .key('heat-y-title')
}