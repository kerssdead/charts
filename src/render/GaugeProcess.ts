import GaugeData from "types/data/GaugeData"
import QueueItemsBuilder from "builders/QueueItemsBuilder"
import Sector from "types/Sector"
import {COORDS_MAX_X, COORDS_MAX_Y} from "static/constants/Index"

// todo: add labels
// todo: add interaction with mouse
// todo: add init animation
// todo: add positioning
// todo: add rendering several lines at the same time
// todo: add context menu

export default class GaugeProcess {
    private data: GaugeData

    constructor(data: GaugeData) {
        this.data = data
    }

    getData() {
        return this.data.values.flatMap(sector => this.getValue(sector))
    }

    private getValue(sector: Sector) {
        const value = (sector.value - this.data.min)
            / (this.data.max - this.data.min)
        const angle = Math.PI * value

        return (items: QueueItemsBuilder) => {
            items.arc()
                .position(COORDS_MAX_X / 2, COORDS_MAX_Y)
                .startAngle(Math.PI)
                .endAngle(Math.PI + angle)
                .radius(COORDS_MAX_X / 4)
                .fill()
                .color(sector.color)
        }
    }
}