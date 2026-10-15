import PieData from "types/data/PieData";
import QueueItemsBuilder from "builders/QueueItemsBuilder";
import Sector from "types/Sector";
import {COORDS_MAX_X, COORDS_MAX_Y} from "static/constants/Index";
import {TextAlignment} from "static/Enums";
import Point from "types/Point";

const LABEL_GAP = 12

const LABEL_SPACE = 32

const LABEL_FONT = 14

// todo: add init animation
// todo: add tooltips
// todo: add inner title
// todo: add inner radius

export default class PieProcess {
    private data: PieData

    private readonly pixel: Point

    private scale: number = 0

    private acc: number = 0

    // todo: use for init animation
    private minAngle: number = 0

    // todo: use for init animation
    private maxAngle: number = Math.PI * 2

    constructor(data: PieData, pixel: Point) {
        this.data = data
        this.pixel = pixel
    }

    private get radius() {
        const width = COORDS_MAX_X / this.pixel.x
        const height = COORDS_MAX_Y / this.pixel.y

        return Math.max(Math.min(width / 6, height / 2 - LABEL_SPACE), 0)
    }

    getData() {
        this.acc = this.minAngle

        const sum = this.data.values.filter(s => !s.disabled).sumByField(s => s.value)
        this.scale = sum == 0 ? 0 : (this.maxAngle - this.minAngle) / sum

        return this.data.values.flatMap((sector, index) => {
            return [this.getSector(sector, index)]
        })
    }

    private getSector(sector: Sector, index: number) {
        const angle = sector.disabled ? 0 : sector.value * this.scale

        const startAngle = this.acc
        const endAngle = this.acc + angle

        this.acc += angle

        const center = {
            x: COORDS_MAX_X / 2,
            y: COORDS_MAX_Y / 2
        }

        const radius = this.radius * this.pixel.x

        const label = this.getLabelPosition(center, startAngle + angle / 2)

        return (items: QueueItemsBuilder) => {
            const arc = items.arc()
                .position(center.x, center.y)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .radius(radius)
                .fill()
                .color(sector.color)
                .key(`sector-${ index }`)

            const text = items.text(sector.label)
                .position(label.x, label.y)
                .size(LABEL_FONT)
                .align(label.alignment)
                .key(`sector-label-${ index }`)

            if (sector.disabled) {
                arc.ghost()
                text.ghost()
            }
        }
    }

    private getLabelPosition(center: Point, angle: number) {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const distance = this.radius + LABEL_GAP

        const alignment = Math.abs(cos) < 0.2
                          ? TextAlignment.Center
                          : cos > 0 ? TextAlignment.Left : TextAlignment.Right

        const verticalShift = sin * LABEL_FONT / 2

        return {
            x: center.x + (distance * cos + LABEL_FONT / 2) * this.pixel.x,
            y: center.y + (distance * sin + verticalShift) * this.pixel.y,
            alignment
        }
    }
}