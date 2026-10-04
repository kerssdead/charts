import {PieData} from "types/data/PieData";
import QueueItemsBuilder from "builders/QueueItemsBuilder";
import Sector from "types/Sector";
import {COORDS_MAX_X, COORDS_MAX_Y} from "static/constants/Index";

// todo: add init animation
// todo: fix labels
// todo: add tooltips
// todo: add inner title
// todo: add inner radius
// todo: add context menu

export class PieProcess {
    private data: PieData

    private charPrecision: number

    private scale: number = 0

    private acc: number = 0

    // todo: use for init animation
    private minAngle: number = 0

    // todo: use for init animation
    private maxAngle: number = Math.PI * 2

    constructor(data: PieData, charPrecision: number) {
        this.data = data
        this.charPrecision = charPrecision
    }

    getData() {
        this.acc = this.minAngle

        const sum = this.data.values.sumByField(s => s.value)
        this.scale = (this.maxAngle - this.minAngle) / sum

        return this.data.values.flatMap(sector => {
            return [this.getSector(sector)]
        })
    }

    private getSector(sector: Sector) {
        const angle = sector.value * this.scale

        const startAngle = this.acc
        const endAngle = this.acc + angle

        this.acc += angle

        const center = {
            x: COORDS_MAX_X / 2,
            y: COORDS_MAX_Y / 2
        }
        const radius = COORDS_MAX_X / 6

        const textPosition = {
            x: center.x + (radius + 100) * Math.cos(startAngle + angle / 2),
            y: center.y + (radius + 100) * Math.sin(startAngle + angle / 2)
        }

        return (items: QueueItemsBuilder) => {
            items.arc()
                .position(center.x, center.y)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .radius(radius)
                .fill()
                .color(sector.color)

            items.text(sector.label)
                // todo: position is broken
                .position(textPosition.x, textPosition.y)
                .color('black')
        }
    }
}