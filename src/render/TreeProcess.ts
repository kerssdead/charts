import TreeData, { getTreeSum, TreeValue } from '@/types/data/TreeData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { contrastText, spreadColor } from '@/helpers/Color'
import { stringWidth } from '@/helpers/Text'
import { sum } from '@/helpers/Collections'
import RectangleDimensions from '@/types/RectangleDimensions'
import ChartProcess from '@/render/ChartProcess'

const COLOR_RANGE = 40

const LABEL_FONT = 14

const LABEL_PADDING = 8

const CORNER_RADIUS = 80

type Cell<T> = {
    value: T
    box: RectangleDimensions
}

type Block = {
    color: string
    value: TreeValue
    key: string
    box: RectangleDimensions
    group?: TreeValue
}

export default class TreeProcess extends ChartProcess<TreeData> {
    getData() {
        const box = {
            x: this.data.padding,
            y: this.data.padding,
            width: COORDS_MAX_X - this.data.padding * 2,
            height: COORDS_MAX_Y - this.data.padding * 2
        }

        const groups = TreeProcess.prepare(this.data.values.filter(value => !value.disabled), getTreeSum)

        const blocks = groups.length == 1 && groups[0].sectors?.length
                       ? this.getSectors(groups[0], 0, box)
                       : this.layout(groups, box, getTreeSum).flatMap(({ value, box }, index) => {
                           return value.sectors?.length
                                  ? this.getSectors(value, index, box)
                                  : [{ color: value.color, value, key: `tree-${ index }`, box }]
                       })

        return blocks.map((block, order) => this.getBlock(block, order))
    }

    private getSectors(group: TreeValue, groupIndex: number, box: RectangleDimensions): Block[] {
        const sectors = TreeProcess.prepare(group.sectors ?? [], value => value.value)

        return this.layout(sectors, box, value => value.value).map(({ value, box }, index) => {
            const color = spreadColor(group.color, index, sectors.length, COLOR_RANGE)

            return { color, value, key: `tree-${ groupIndex }-${ index }`, box, group }
        })
    }

    private layout<T>(values: T[], box: RectangleDimensions, getValue: (value: T) => number): Cell<T>[] {
        const right = box.x + box.width
        const bottom = box.y + box.height

        const unit = box.width * box.height / sum(values, getValue)

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

            const widthGap = isVertical && !isLast ? this.data.gap / 2 : 0
            const heightGap = isVertical || isLast ? 0 : this.data.gap / 2

            return { value, box: { x, y, width: w - widthGap, height: h - heightGap } }
        })
    }

    private getBlock({ color, value, key, box, group }: Block, order: number) {
        const delay = order * AnimationTiming.treeInitStagger

        const label = value.label

        const isLabelVisible = !!label
                               && stringWidth(label, LABEL_FONT) + LABEL_PADDING * 2 <= this.units.toPxX(box.width)
                               && LABEL_FONT + LABEL_PADDING * 2 <= this.units.toPxY(box.height)

        return (items: QueueItemsBuilder) => {
            items.rect()
                 .position(box.x + box.width / 2, box.y + box.height / 2)
                 .size(box.width, box.height)
                 .align(HorizontalAlignment.Center, VerticalAlignment.Center)
                 .round(CORNER_RADIUS)
                 .fill()
                 .gradient()
                 .color(color)
                 .key(key)
                 .init(AnimationTiming.treeInit, delay, true)
                 .appearDelay(delay)
                 .interact()
                 .tooltip(this.getTooltip(value, group))
                 .data(value.data)
                 .contextMenu()

            if (isLabelVisible)
                items.text(label)
                     .position(box.x + box.width / 2, box.y + box.height / 2)
                     .size(LABEL_FONT)
                     .align(TextAlignment.Center)
                     .color(contrastText(color))
                     .key(`${ key }-label`)
                     .init(AnimationTiming.treeInit, delay, true)
        }
    }

    private getTooltip(value: TreeValue, group?: TreeValue) {
        return this.tooltip(group?.label, value.label, this.formatValue(getTreeSum(value)))
    }

    private static prepare<T>(values: T[], getValue: (value: T) => number) {
        return values.filter(value => getValue(value) > 0)
                     .sort((a, b) => getValue(b) - getValue(a))
    }
}