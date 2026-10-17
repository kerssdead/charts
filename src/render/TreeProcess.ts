import TreeData, { TreeValue } from "types/data/TreeData"
import QueueItemsBuilder from "builders/QueueItemsBuilder"
import { Animations, COORDS_MAX_X, COORDS_MAX_Y } from "static/constants/Index"
import { HorizontalAlignment, PlotAxisType, TextAlignment, VerticalAlignment } from "static/Enums"
import { adjustColor, contrastText, stringWidth } from "Helper"
import Point from "types/Point"
import ChartSettings from "types/ChartSettings"
import Formatter from "helpers/Formatter"

const COLOR_RANGE = 40

const LABEL_FONT = 14

const LABEL_PADDING = 8

type Box = {
    x: number
    y: number
    width: number
    height: number
}

type Cell<T> = {
    value: T
    box: Box
}

export default class TreeProcess {
    private data: TreeData

    private readonly padding: number

    private readonly gap: number

    private readonly pixel: Point

    private readonly valuePostfix: string | undefined

    private order: number = 0

    constructor(data: TreeData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.pixel = pixel
        this.valuePostfix = settings.valuePostfix

        this.padding = this.data.padding
        this.gap = this.data.gap
    }

    getData() {
        this.order = 0

        const box = {
            x: this.padding,
            y: this.padding,
            width: COORDS_MAX_X - this.padding * 2,
            height: COORDS_MAX_Y - this.padding * 2
        }

        const groups = TreeProcess.prepare(this.data.values.filter(value => !value.disabled), TreeProcess.getSum)

        if (groups.length == 1 && groups[0].sectors?.length)
            return this.getSectors(groups[0], 0, box)

        return this.layout(groups, box, TreeProcess.getSum).flatMap(({ value, box }, index) => {
            return value.sectors?.length
                   ? this.getSectors(value, index, box)
                   : [this.getBlock(value.color, value, `tree-${ index }`, box)]
        })
    }

    private getSectors(group: TreeValue, groupIndex: number, box: Box) {
        const sectors = TreeProcess.prepare(group.sectors ?? [], value => value.value)

        return this.layout(sectors, box, value => value.value).map(({ value, box }, index) => {
            const ratio = sectors.length == 1 ? .5 : index / (sectors.length - 1)
            const color = adjustColor(group.color, Math.round((ratio * 2 - 1) * COLOR_RANGE))

            return this.getBlock(color, value, `tree-${ groupIndex }-${ index }`, box, group)
        })
    }

    private layout<T>(values: T[], box: Box, getValue: (value: T) => number): Cell<T>[] {
        const right = box.x + box.width
        const bottom = box.y + box.height

        const unit = box.width * box.height / values.sumByField(getValue)

        const position = { x: box.x, y: box.y }

        return values.map((value, index) => {
            const { x, y } = position

            const isVertical = (index % 2 === 0)
            const isLast = index + 1 == values.length

            const area = getValue(value) * unit

            const w = isVertical ? (area / (bottom - y)) : (right - x)
            const h = isVertical ? (bottom - y) : (area / (right - x))

            if (isVertical) {
                position.x += w
            } else {
                position.y += h
            }

            const widthGap = isVertical && !isLast ? this.gap / 2 * this.pixel.x : 0
            const heightGap = isVertical || isLast ? 0 : this.gap / 2 * this.pixel.y

            return { value, box: { x, y, width: w - widthGap, height: h - heightGap } }
        })
    }

    private getBlock(color: string, value: TreeValue, key: string, box: Box, group?: TreeValue) {
        const delay = this.order++ * Animations.treeInitStagger

        const label = value.label

        const isLabelVisible = !!label
                               && stringWidth(label, LABEL_FONT) + LABEL_PADDING * 2 <= box.width / this.pixel.x
                               && LABEL_FONT + LABEL_PADDING * 2 <= box.height / this.pixel.y

        return (items: QueueItemsBuilder) => {
            items.rect()
                 .position(box.x + box.width / 2, box.y + box.height / 2)
                 .size(box.width, box.height)
                 .align(HorizontalAlignment.Center, VerticalAlignment.Center)
                 .round([16, 16, 16, 16])
                 .fill()
                 .gradient()
                 .color(color)
                 .key(key)
                 .init(Animations.treeInit, delay, true)
                 .appearDelay(delay)
                 .interact()
                 .tooltip(this.getTooltip(value, group))
                 .data(value.data)
                 .contextMenu()

            if (isLabelVisible)
                items.text(label)
                     .position(box.x + box.width / 2 + LABEL_FONT / 2 * this.pixel.x, box.y + box.height / 2)
                     .size(LABEL_FONT)
                     .align(TextAlignment.Center)
                     .color(contrastText(color))
                     .key(`${ key }-label`)
                     .init(Animations.treeInit, delay, true)
        }
    }

    private getTooltip(value: TreeValue, group?: TreeValue) {
        const rows = [group?.label, value.label, Formatter.format(TreeProcess.getSum(value), PlotAxisType.Number, this.valuePostfix)]

        return rows.filter(row => row).join('\n')
    }

    private static prepare<T>(values: T[], getValue: (value: T) => number) {
        return values.filter(value => getValue(value) > 0)
                     .sort((a, b) => getValue(b) - getValue(a))
    }

    private static getSum(value: TreeValue) {
        return value.sectors?.length
               ? value.sectors.filter(sector => sector.value > 0).sumByField(sector => sector.value)
               : value.value
    }
}