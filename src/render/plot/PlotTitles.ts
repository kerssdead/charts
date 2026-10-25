import PlotData from '@/types/data/PlotData'
import Units from '@/helpers/Units'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { CANVAS_CENTER, COORDS_MAX_Y } from '@/static/constants/Index'
import { TextBaseline } from '@/static/Enums'
import PlotLayout from '@/render/plot/PlotLayout'
import { AXIS_TITLE_FONT, BOTTOM_PADDING, LEFT_PADDING, TOP_BASELINE_GAP } from '@/render/plot/PlotConstants'

export default class PlotTitles {
    private readonly data: PlotData

    private readonly units: Units

    private readonly layout: PlotLayout

    constructor(data: PlotData, units: Units, layout: PlotLayout) {
        this.data = data
        this.units = units
        this.layout = layout
    }

    getItems() {
        if (this.data.simple)
            return QueueItemsBuilder.empty

        const { leftTitle, bottomTitle } = this.layout

        return (items: QueueItemsBuilder) => {
            if (leftTitle) {
                items.text(leftTitle)
                     .position(this.units.x(LEFT_PADDING + TOP_BASELINE_GAP), COORDS_MAX_Y / 2)
                     .baseline(TextBaseline.Top)
                     .size(AXIS_TITLE_FONT)
                     .rotate(Math.PI * 1.5)
                     .key('axis-title-x')
            }

            if (bottomTitle) {
                items.text(bottomTitle)
                     .position(CANVAS_CENTER.x, COORDS_MAX_Y - this.units.y(BOTTOM_PADDING + AXIS_TITLE_FONT / 2))
                     .size(AXIS_TITLE_FONT)
                     .key('axis-title-y')
            }
        }
    }
}