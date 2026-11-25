import HeatMapData, { isPointData } from '@/types/data/HeatMapData'
import HeatMapCell from '@/types/HeatMapCell'
import ItemData from '@/types/ItemData'
import { maxOf } from '@/helpers/Collections'
import { DEFAULT_RESOLUTION } from '@/render/heatMap/HeatMapConstants'
import { Extent, getResolution } from '@/render/heatMap/HeatMapLayout'

export type GridCell = {
    column: number
    row: number
    value: number
    label?: string
    color?: string
    data?: ItemData
}

export type Grid = {
    columns: number
    rows: number
    cells: GridCell[]
    extent: Extent | null
    min: number
    max: number
}

export function getGrid(data: HeatMapData, imageExtent: Extent | null): Grid {
    const extent = getExtent(data) ?? imageExtent

    return isPointData(data) ? getPointGrid(data, extent) : getLabeledGrid(data, extent)
}

export function getExtent({ width, height }: HeatMapData): Extent | null {
    return width && height && width > 0 && height > 0 ? { width, height } : null
}

export function getLabeledGrid(data: HeatMapData, extent: Extent | null): Grid {
    const columns = new Map(data.xLabels.map((label, index) => [label, index]))
    const rows = new Map(data.yLabels.map((label, index) => [label, index]))

    const cells = data.values.map(cell => ({
        column: columns.get(String(cell.x)) as number,
        row: rows.get(String(cell.y)) as number,
        value: cell.value,
        label: cell.label,
        color: cell.color,
        data: cell.data
    }))

    return { columns: columns.size, rows: rows.size, cells, extent, ...getValueRange(cells) }
}

function getPointGrid(data: HeatMapData, knownExtent: Extent | null): Grid {
    const extent = knownExtent ?? getPointsExtent(data.values)
    const { columns, rows } = getResolution(data.resolution ?? DEFAULT_RESOLUTION, extent)
    const sums = new Map<number, number>()

    for (const point of data.values) {
        const x = Number(point.x)
        const y = Number(point.y)

        if (!isInside(x, y, extent))
            continue

        const column = Math.min(columns - 1, Math.floor(x / extent.width * columns))
        const row = Math.min(rows - 1, Math.floor(y / extent.height * rows))
        const index = row * columns + column

        sums.set(index, (sums.get(index) ?? 0) + point.value)
    }

    const cells = [...sums].map(([index, value]) => {
        const column = index % columns
        const row = Math.floor(index / columns)

        return {
            column,
            row,
            value,
            label: getBinLabel(extent, { column, row }, { columns, rows })
        }
    })

    return { columns, rows, cells, extent, ...getValueRange(cells) }
}

export function getCellsByIndex({ columns, rows, cells }: Grid) {
    const cellsByIndex: (GridCell | undefined)[] = new Array(columns * rows)

    for (const cell of cells)
        cellsByIndex[cell.row * columns + cell.column] = cell

    return cellsByIndex
}

export function getValueRange(cells: GridCell[]) {
    let min = Infinity
    let max = -Infinity

    for (const { value } of cells) {
        min = Math.min(min, value)
        max = Math.max(max, value)
    }

    return { min, max }
}

export function getPointsExtent(points: HeatMapCell[]): Extent {
    return {
        width: Math.max(maxOf(points, point => Number(point.x)), 1),
        height: Math.max(maxOf(points, point => Number(point.y)), 1)
    }
}

type CellPosition = {
    column: number
    row: number
}

type GridSize = {
    columns: number
    rows: number
}

function getBinLabel(extent: Extent, { column, row }: CellPosition, { columns, rows }: GridSize) {
    const range = (index: number, count: number, size: number) => {
        return `${ roundCoordinate(index * size / count) }–${ roundCoordinate((index + 1) * size / count) }`
    }

    return `x ${ range(column, columns, extent.width) }, y ${ range(row, rows, extent.height) }`
}

export function roundCoordinate(value: number) {
    return Number(value.toFixed(2))
}

export function isInside(x: number, y: number, extent: Extent) {
    return x >= 0 && y >= 0 && x <= extent.width && y <= extent.height
}