import Sector from '@/types/Sector'
import { stringWidth } from '@/helpers/Text'
import { sum } from '@/helpers/Collections'
import {
    LABEL_FONT_SIZE,
    LEGEND_ITEM_SPACING,
    MARKER_RADIUS,
    MARKER_TEXT_GAP
} from '@/render/gauge/GaugeConstants'

export type LegendItem = {
    key: string
    text: string
    color: string
    width: number
}

export function getLegendItems(sectors: Sector[], formatValue: (value: number) => string): LegendItem[] {
    return sectors.map((sector, index) => {
        const text = `${ sector.label }: ${ formatValue(sector.value) }`

        return {
            key: `gauge-label-${ index }`,
            text,
            color: sector.color,
            width: MARKER_RADIUS + MARKER_TEXT_GAP + stringWidth(text, LABEL_FONT_SIZE)
        }
    })
}

export function getLegendLines(legendItems: LegendItem[], availableWidth: number): LegendItem[][] {
    const legendLines: LegendItem[][] = []

    let lastLineWidth = 0

    for (const legendItem of legendItems) {
        const lastLine = legendLines[legendLines.length - 1]

        if (lastLine && lastLineWidth + LEGEND_ITEM_SPACING + legendItem.width <= availableWidth) {
            lastLine.push(legendItem)
            lastLineWidth += LEGEND_ITEM_SPACING + legendItem.width
        } else {
            legendLines.push([legendItem])
            lastLineWidth = legendItem.width
        }
    }

    return legendLines
}

export function getLineLeft(legendLine: LegendItem[], canvasWidth: number) {
    return (canvasWidth - sum(legendLine, legendItem => legendItem.width)
            - LEGEND_ITEM_SPACING * (legendLine.length - 1)) / 2
}