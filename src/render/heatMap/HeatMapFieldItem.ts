import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import { sampleField } from '@/helpers/FieldSampling'
import { clamp } from '@/helpers/Geometry'
import { toUnits } from '@/render/heatMap/HeatMapLayout'
import { roundCoordinate } from '@/render/heatMap/HeatMapGrid'
import { Field } from '@/render/heatMap/HeatMapField'
import { REVEAL_DURATION } from '@/render/heatMap/HeatMapConstants'

export type FieldItemContext = {
    units: Units
    lut: Uint32Array
    isAlive: boolean | undefined
    formatValue: (value: number) => string
    tooltip: (...rows: (string | undefined)[]) => string
}

export default class HeatMapFieldItem {
    constructor(private readonly context: FieldItemContext) {
    }

    getAction(field: Field, area: RectangleDimensions): QueueAction {
        const { units, lut, isAlive } = this.context
        const box = toUnits(units, area)

        return (items: QueueItemsBuilder) => {
            items.field()
                 .box(box.x, box.y, box.width, box.height)
                 .field({ ...field, lut, alive: isAlive })
                 .lookup((u, v) => this.describe(field, u, v))
                 .init(REVEAL_DURATION, 0, true)
                 .appearDuration(REVEAL_DURATION)
                 .interact()
                 .contextMenu()
                 .key('heat-field')
        }
    }

    private describe(field: Field, u: number, v: number) {
        const { formatValue, tooltip } = this.context

        if (field.cells) {
            const column = clamp(Math.floor(u * field.columns), 0, field.columns - 1)
            const row = clamp(Math.floor(v * field.rows), 0, field.rows - 1)
            const cell = field.cells[row * field.columns + column]

            return cell ? tooltip(cell.label, formatValue(cell.value)) : null
        }

        const { extent } = field
        const x = extent && roundCoordinate(u * extent.width)
        const y = extent && roundCoordinate(v * extent.height)
        const position = extent && `x ${ x }, y ${ y }`

        return tooltip(position ?? undefined, formatValue(sampleField(field, u, v)))
    }
}