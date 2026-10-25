import TreeData, { getTreeSum, TreeValue } from '@/types/data/TreeData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { HorizontalAlignment, TextAlignment, VerticalAlignment } from '@/static/Enums'
import { contrastText, spreadColor } from '@/helpers/Color'
import { stringWidth } from '@/helpers/Text'
import RectangleDimensions from '@/types/RectangleDimensions'
import ChartProcess from '@/render/ChartProcess'
import * as TreeMapLayout from '@/render/tree/TreeMapLayout'
import { COLOR_RANGE, CORNER_RADIUS, DEFAULT_GAP, LABEL_FONT_SIZE, LABEL_PADDING } from '@/render/tree/TreeMapConstants'

type Block = {
    color: string
    value: TreeValue
    key: string
    box: RectangleDimensions
    group?: TreeValue
}

export default class TreeMapProcess extends ChartProcess<TreeData> {
    private readonly gap = Number.isFinite(this.data.gap) ? this.data.gap : DEFAULT_GAP

    isEmpty() {
        return !this.data.values.some(value => !value.disabled && getTreeSum(value) > 0)
    }

    getData() {
        const padding = this.data.padding || 0

        const box = {
            x: padding,
            y: padding,
            width: COORDS_MAX_X - padding * 2,
            height: COORDS_MAX_Y - padding * 2
        }

        const groups = TreeMapLayout.getPositiveSortedDescending(
            this.data.values.filter(value => !value.disabled),
            getTreeSum
        )

        const singleGroup = groups.length == 1 && groups[0].sectors?.length ? groups[0] : undefined

        const blocks = singleGroup
                       ? this.getSectorBlocks(singleGroup, box)
                       : this.getCells(groups, box, getTreeSum).flatMap(({ value, box }) => {
                           return value.sectors?.length
                                  ? this.getSectorBlocks(value, box)
                                  : [{ color: value.color, value, key: `tree-${ value.id }`, box }]
                       })

        return blocks.map((block, order) => this.getBlock(block, order))
    }

    private getSectorBlocks(group: TreeValue, box: RectangleDimensions): Block[] {
        const sectors = TreeMapLayout.getPositiveSortedDescending(group.sectors ?? [], value => value.value)

        return this.getCells(sectors, box, value => value.value).map(({ value, box }, index) => {
            const color = value.color || spreadColor(group.color, index, sectors.length, COLOR_RANGE)

            return { color, value, key: `tree-${ group.id }-${ group.sectors?.indexOf(value) }`, box, group }
        })
    }

    private getCells<T>(values: T[], box: RectangleDimensions, getValue: (value: T) => number) {
        return TreeMapLayout.getCells(values, box, getValue, this.units, this.gap)
    }

    private getBlock({ color, value, key, box, group }: Block, order: number) {
        const delay = order * AnimationTiming.treeInitStagger

        const label = value.label

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

            if (label && this.fitsLabel(label, box))
                items.text(label)
                     .position(box.x + box.width / 2, box.y + box.height / 2)
                     .size(LABEL_FONT_SIZE)
                     .align(TextAlignment.Center)
                     .color(contrastText(color))
                     .key(`${ key }-label`)
                     .init(AnimationTiming.treeInit, delay, true)
        }
    }

    private fitsLabel(label: string, box: RectangleDimensions) {
        return stringWidth(label, LABEL_FONT_SIZE) + LABEL_PADDING * 2 <= this.units.toPxX(box.width)
               && LABEL_FONT_SIZE + LABEL_PADDING * 2 <= this.units.toPxY(box.height)
    }

    private getTooltip(value: TreeValue, group?: TreeValue) {
        return this.tooltip(group?.label, value.label, this.formatValue(getTreeSum(value)))
    }
}