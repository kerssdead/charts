import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import CellsRenderData, { CellLabel } from '@/types/CellsRenderData'
import Units from '@/helpers/Units'
import { contrastTextColor } from '@/helpers/Color'
import { packColor } from '@/helpers/PackedColor'
import { stringWidth } from '@/helpers/Text'
import { getColorRatio, toUnits } from '@/render/heatMap/HeatMapLayout'
import { getCellsByIndex, Grid, GridCell } from '@/render/heatMap/HeatMapGrid'
import { CELL_FONT, CELL_PADDING, REVEAL_DURATION } from '@/render/heatMap/HeatMapConstants'

export type CellItemsContext = {
    units: Units
    colors: string[]
    textColor: string
    hasImage: boolean
    formatValue: (value: number) => string
    tooltip: (...rows: (string | undefined)[]) => string
}

type CellLayout = {
    area: RectangleDimensions
}

export default class HeatMapCellItems {
    private readonly context: CellItemsContext

    constructor(context: CellItemsContext) {
        this.context = context
    }

    getActions(grid: Grid, { area }: CellLayout): QueueAction[] {
        const { units, formatValue, tooltip } = this.context
        const box = toUnits(units, area)
        const cellsByIndex = getCellsByIndex(grid)
        const cells = this.getRenderData(grid, area)

        return [
            (items: QueueItemsBuilder) => {
                items.cells()
                     .box(box.x, box.y, box.width, box.height)
                     .cells(cells)
                     .lookup(index => {
                         const cell = cellsByIndex[index]

                         return cell ? tooltip(cell.label, formatValue(cell.value)) : null
                     })
                     .dataLookup(index => cellsByIndex[index]?.data ?? null)
                     .init(REVEAL_DURATION)
                     .appearDuration(REVEAL_DURATION)
                     .fade(false)
                     .interact()
                     .contextMenu()
                     .key('heat-cells')
            }
        ]
    }

    private getRenderData(grid: Grid, area: RectangleDimensions): CellsRenderData {
        const { columns, rows, min, max } = grid
        const colors = new Uint32Array(columns * rows)
        const delays = new Float32Array(columns * rows)
        const labels: (CellLabel | null)[] = new Array(columns * rows).fill(null)
        const ranks = [...grid.cells].sort((a, b) => b.value - a.value)
        const lastRank = Math.max(ranks.length - 1, 1)
        const fitsHeight = CELL_FONT + CELL_PADDING * 2 <= area.height / rows
        let hasLabels = false

        ranks.forEach((cell, rank) => {
            const index = cell.row * columns + cell.column
            const color = cell.color || this.getRampColor(getColorRatio(cell.value, min, max))
            const label = fitsHeight ? this.getLabel(cell, color, area.width / columns) : null

            colors[index] = packColor(color)
            delays[index] = rank / lastRank
            labels[index] = label
            hasLabels ||= label !== null
        })

        return { columns, rows, colors, delays, labels: hasLabels ? labels : [], labelSize: CELL_FONT }
    }

    private getRampColor(ratio: number) {
        const { colors } = this.context

        return colors[Math.round(ratio * (colors.length - 1))]
    }

    private getLabel(cell: GridCell, color: string, width: number): CellLabel | null {
        const text = this.context.formatValue(cell.value)

        if (stringWidth(text, CELL_FONT) + CELL_PADDING * 2 > width)
            return null

        const { hasImage, textColor } = this.context

        return { text, color: hasImage && !cell.color ? textColor : contrastTextColor(color) }
    }
}