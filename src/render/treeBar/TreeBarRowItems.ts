import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'
import ItemData from '@/types/ItemData'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { withAlpha } from '@/helpers/Color'
import { getTreeBarTotal, TreeBarEntry } from '@/types/data/TreeBarData'
import { Layer } from '@/static/constants/Index'
import { ImageCrossOrigin, TextAlignment } from '@/static/Enums'
import * as TreeBarRowText from '@/render/treeBar/TreeBarRowText'
import { BarArea, Column } from '@/render/treeBar/TreeBarLayout'
import { addClickArea, getMutedTextColor } from '@/render/treeBar/TreeBarItems'
import {
    BAR_HEIGHT,
    BAR_LABEL_FONT_SIZE,
    BAR_LABEL_GAP,
    BAR_RADIUS,
    CELL_FONT_SIZE,
    GRID_WIDTH,
    IMAGE_PLACEHOLDER_ALPHA,
    IMAGE_SIZE,
    INDENT,
    LINE_HEIGHT,
    PADDING,
    ROW_APPEAR_DELAY,
    TOGGLE_LINE_WIDTH,
    TOGGLE_SIZE,
    TOGGLE_WIDTH,
    TRANSPARENT
} from '@/render/treeBar/TreeBarConstants'

export type TreeBarRowEntry = TreeBarEntry & {
    y: number
    height: number
}

export type TreeBarGeometry = {
    width: number
    nameWidth: number
    columns: Column[]
    barArea: BarArea
    barLabelWidth: number
    maxTickValue: number
}

export type TreeBarRowActions = {
    getPartTooltip: (part: Sector, label: string) => string
    getPartData: (part: Sector) => ItemData | undefined
    onToggle: () => void
}

type RowContext = {
    key: string
    node: TreeBarRow
    center: number
}

export default class TreeBarRowItems {
    private readonly units: Units

    private readonly geometry: TreeBarGeometry

    private readonly imageCrossOrigin: ImageCrossOrigin | undefined

    private readonly actions: TreeBarRowActions

    constructor(
        units: Units,
        geometry: TreeBarGeometry,
        imageCrossOrigin: ImageCrossOrigin | undefined,
        actions: TreeBarRowActions
    ) {
        this.units = units
        this.geometry = geometry
        this.imageCrossOrigin = imageCrossOrigin
        this.actions = actions
    }

    add(items: QueueItemsBuilder, { node, level, y, height }: TreeBarRowEntry) {
        const row = { key: `tree-bar-row-${ node.id }`, node, center: y + height / 2 }
        const left = PADDING + level * INDENT

        this.addGridLine(items, row.key, y + height)

        if (node.hasChildren)
            this.addToggle(items, row, { x: left + TOGGLE_WIDTH / 2, y: row.center }, {
                x: PADDING,
                y,
                width: this.geometry.nameWidth,
                height
            })

        if (node.image)
            items.image(node.image)
                 .position(this.x(left + TOGGLE_WIDTH + IMAGE_SIZE / 2), this.y(row.center))
                 .size(this.x(IMAGE_SIZE))
                 .crossOrigin(this.imageCrossOrigin)
                 .color(withAlpha(Theme.text, IMAGE_PLACEHOLDER_ALPHA))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ row.key }-image`)

        this.addLabels(items, row, left + TreeBarRowText.getTextOffset(node))
        this.addBarParts(items, row)

        for (const column of this.geometry.columns)
            items.text(TreeBarRowText.formatCell(node.cells?.[column.key]))
                 .position(this.x(column.right), this.y(row.center))
                 .size(CELL_FONT_SIZE)
                 .align(TextAlignment.Right)
                 .clip(this.x(column.width))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ row.key }-cell-${ column.key }`)
    }

    private x(px: number) {
        return this.units.x(px)
    }

    private y(px: number) {
        return this.units.y(px)
    }

    private addGridLine(items: QueueItemsBuilder, key: string, bottom: number) {
        const gridLine = {
            x: PADDING,
            y: bottom - GRID_WIDTH,
            width: this.geometry.width - PADDING * 2,
            height: GRID_WIDTH
        }

        items.rect()
             .box(this.units, gridLine)
             .collapse(false, false)
             .fill()
             .color(Theme.lineAxis)
             .stroke(TRANSPARENT)
             .layer(Layer.Base)
             .appearDelay(ROW_APPEAR_DELAY)
             .key(`${ key }-line`)
    }

    private addToggle(items: QueueItemsBuilder, row: RowContext, { x, y }: Point, area: RectangleDimensions) {
        const { key, node } = row
        const size = TOGGLE_SIZE

        const points = node.expanded
                       ? [[x - size, y - size / 2], [x, y + size / 2], [x + size, y - size / 2]]
                       : [[x - size / 2, y - size], [x + size / 2, y], [x - size / 2, y + size]]

        const line = items.line()

        for (const [px, py] of points)
            line.stop(this.x(px), this.y(py))

        line.width(TOGGLE_LINE_WIDTH)
            .color(getMutedTextColor())
            .layer(Layer.Data)
            .appearDelay(ROW_APPEAR_DELAY)
            .key(`${ key }-toggle`)

        addClickArea(items, this.units, area, () => {
            node.expanded = !node.expanded

            this.actions.onToggle()
        }).key(`${ key }-toggle-area`)
    }

    private addLabels(items: QueueItemsBuilder, { key, node, center }: RowContext, x: number) {
        const lines = TreeBarRowText.getLines(node)
        const width = PADDING + this.geometry.nameWidth - x

        lines.forEach((line, index) => {
            const text = items.text(line.text)
                              .position(this.x(x), this.y(center + (index - (lines.length - 1) / 2) * LINE_HEIGHT))
                              .size(TreeBarRowText.getLineFontSize(line))
                              .align(TextAlignment.Left)
                              .clip(this.x(width))
                              .appearDelay(ROW_APPEAR_DELAY)
                              .key(`${ key }-label-${ index }`)

            if (line.isSubLabel)
                text.color(getMutedTextColor())
        })
    }

    private addBarParts(items: QueueItemsBuilder, { key, node, center }: RowContext) {
        const { barArea, maxTickValue, barLabelWidth } = this.geometry
        const parts = node.parts.filter(part => part.value > 0)
        const total = getTreeBarTotal(node)
        const widthPerValue = barArea.width / maxTickValue
        const top = center - BAR_HEIGHT / 2

        const barBox = {
            x: this.x(barArea.x),
            y: this.y(top),
            width: this.x(total * widthPerValue),
            height: this.y(BAR_HEIGHT)
        }

        let x = barArea.x

        parts.forEach((part, index) => {
            const partKey = `${ key }-part-${ index }`
            const width = part.value * widthPerValue
            const label = part.label || node.label.replace(/\n/g, ' ')

            items.rect()
                 .box(this.units, { x, y: top, width, height: BAR_HEIGHT })
                 .clip(barBox, this.x(BAR_RADIUS))
                 .collapse(false, false)
                 .fill()
                 .color(part.color)
                 .layer(Layer.Data)
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(partKey)
                 .hoverGroup(partKey)
                 .monochrome()
                 .interact()
                 .contextMenu()
                 .tooltipHtml(this.actions.getPartTooltip(part, label))
                 .data(this.actions.getPartData(part))

            x += width
        })

        if (node.barLabel)
            items.text(node.barLabel)
                 .position(this.x(barArea.x + total * widthPerValue + BAR_LABEL_GAP), this.y(center))
                 .size(BAR_LABEL_FONT_SIZE)
                 .align(TextAlignment.Left)
                 .clip(this.x(barLabelWidth))
                 .appearDelay(ROW_APPEAR_DELAY)
                 .key(`${ key }-bar-label`)
    }
}