import { TreeBarColumn, TreeBarEntry } from '@/types/data/TreeBarData'
import { maxOf } from '@/helpers/Collections'
import { clamp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import * as TreeBarRowText from '@/render/treeBar/TreeBarRowText'
import {
    CELL_FONT_SIZE,
    COLUMN_GAP,
    COLUMN_MAX_SHARE,
    GAP,
    HEADER_FONT_SIZE,
    INDENT,
    NAME_MAX_SHARE,
    NAME_MIN_WIDTH,
    PADDING,
    SORT_ASCENDING
} from '@/render/treeBar/TreeBarConstants'

export type Column = TreeBarColumn & {
    left: number
    right: number
    width: number
}

export type BarArea = {
    x: number
    width: number
}

export function getNameWidth(entries: TreeBarEntry[], chartWidth: number) {
    const width = maxOf(entries, ({ node, level }) => {
        const textWidth = maxOf(
            TreeBarRowText.getLines(node),
            line => stringWidth(line.text, TreeBarRowText.getLineFontSize(line))
        )

        return level * INDENT + TreeBarRowText.getTextOffset(node) + textWidth
    })

    const maxWidth = chartWidth * NAME_MAX_SHARE

    return clamp(width, Math.min(NAME_MIN_WIDTH, maxWidth), maxWidth)
}

export function getColumns(
    columns: TreeBarColumn[],
    entries: TreeBarEntry[],
    contentRight: number,
    chartWidth: number
): Column[] {
    let right = contentRight

    return [...columns].reverse().map(column => {
        const width = Math.min(Math.max(
            stringWidth(column.title + SORT_ASCENDING, HEADER_FONT_SIZE),
            maxOf(entries, ({ node }) => stringWidth(TreeBarRowText.formatCell(node.cells?.[column.key]), CELL_FONT_SIZE))
        ), chartWidth * COLUMN_MAX_SHARE)

        const result = { ...column, left: right - width, right, width }

        right -= width + COLUMN_GAP

        return result
    }).reverse()
}

export function getBarArea(nameWidth: number, columns: Column[], contentRight: number, barLabelWidth: number): BarArea {
    const x = PADDING + nameWidth + GAP
    const end = columns.length > 0 ? columns[0].left - GAP : contentRight

    return { x, width: Math.max(end - barLabelWidth - x, 0) }
}