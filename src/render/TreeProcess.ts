import TreeData from "../types/data/TreeData";
import Value from "../types/base/Value";
import QueueItemsBuilder from "../builders/QueueItemsBuilder";
import {COORDS_MAX_X, COORDS_MAX_Y} from "static/constants/Index";
import Point from "../types/Point";
import {HorizontalAlignment, VerticalAlignment} from "../static/Enums";

// todo: add init animation
// todo: add label
// todo: add interaction on mouse over
// todo: make gaps same for x and y axis (maybe)
// todo: add context menu

export default class TreeProcess {
    private data: TreeData

    private position: Point

    private unit: number

    private readonly padding: number

    private readonly gap: number

    private x: Axis = new Axis()

    private y: Axis = new Axis()

    constructor(data: TreeData) {
        this.data = data

        this.data.values = this.data.values.filter(v => v.value > 0)
        this.data.values.sort((a, b) => b.value - a.value)

        this.padding = this.data.padding
        this.gap = this.data.gap
        this.position = {x: this.padding, y: this.padding}
        this.unit = 1
    }

    getData() {
        this.x.min = this.padding
        this.x.max = COORDS_MAX_X - this.padding
        this.y.min = this.padding
        this.y.max = COORDS_MAX_Y - this.padding

        const sum = this.data.values.sumByField(v => v.value)
        const availableSpace = this.x.available * this.y.available

        this.unit = availableSpace / sum

        return this.data.values.flatMap((block, index) => {
            return [this.getBlock(block, index)]
        })
    }

    private getBlock(block: Value, index: number) {
        const x = this.position.x
        const y = this.position.y

        const isVertical = (index % 2 === 0)
        const isLast = index + 1 == this.data.values.length

        const area = block.value * this.unit

        const w = isVertical ? (area / (this.y.max - y)) : (this.x.max - x)
        const h = isVertical ? (this.y.max - y) : (area / (this.x.max - x))

        if (isVertical) {
            this.position.x += w
        } else {
            this.position.y += h
        }

        const widthGap = isVertical && !isLast ? this.gap / 2 : 0
        const heightGap = isVertical || isLast ? 0 : this.gap / 2

        return (items: QueueItemsBuilder) => {
            items.rect()
                .position(x, y)
                .size(w - widthGap, h - heightGap)
                .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                .round([16, 16, 16, 16])
                .fill()
                .color(block.color)
        }
    }
}

class Axis {
    min: number

    max: number

    get available() {
        return this.max - this.min
    }
}