import HeatMapData, { isPointData } from '@/types/data/HeatMapData'
import HeatMapCell from '@/types/HeatMapCell'
import { Diffusion, diffuse } from '@/helpers/FieldBlur'
import { clamp } from '@/helpers/Geometry'
import { DEFAULT_RADIUS_CELLS, DEFAULT_RESOLUTION } from '@/render/heatMap/HeatMapConstants'
import { getCellsByIndex, getExtent, getLabeledGrid, getPointsExtent, GridCell, isInside } from '@/render/heatMap/HeatMapGrid'
import { Extent, getResolution } from '@/render/heatMap/HeatMapLayout'

export type Field = {
    columns: number
    rows: number
    values: Float32Array
    min: number
    max: number
    extent: Extent | null
    cells?: (GridCell | undefined)[]
    diffusion?: Diffusion
}

export function getField(data: HeatMapData, imageExtent: Extent | null): Field {
    const extent = getExtent(data) ?? imageExtent

    return isPointData(data) ? getPointField(data, extent) : getLabeledField(data, extent)
}

function getLabeledField(data: HeatMapData, knownExtent: Extent | null): Field {
    const grid = getLabeledGrid(data, knownExtent)
    const { columns, rows, extent, min, max } = grid
    const cells = getCellsByIndex(grid)
    const values = Float32Array.from(cells, cell => cell?.value ?? 0)

    return { columns, rows, values, min, max, extent, cells }
}

function getPointField(data: HeatMapData, knownExtent: Extent | null): Field {
    const extent = knownExtent ?? getPointsExtent(data.values)
    const { columns, rows } = getResolution(data.resolution ?? DEFAULT_RESOLUTION, extent)
    const stepX = extent.width / columns
    const stepY = extent.height / rows
    const radius = data.radius && data.radius > 0 ? data.radius : stepX * DEFAULT_RADIUS_CELLS
    const sources = getSources(data.values, { columns, rows, stepX, stepY }, extent)
    const diffusion = { sources, sigmaX: radius / stepX, sigmaY: radius / stepY }
    const values = diffuse(diffusion, 1, { columns, rows })

    const max = values.reduce((highest, value) => Math.max(highest, value), 0)

    return { columns, rows, values, min: 0, max, extent, diffusion }
}

type GridSteps = {
    columns: number
    rows: number
    stepX: number
    stepY: number
}

function getSources(points: HeatMapCell[], { columns, rows, stepX, stepY }: GridSteps, extent: Extent) {
    const sources = new Float32Array(columns * rows)

    for (const point of points) {
        const x = Number(point.x)
        const y = Number(point.y)

        if (!isInside(x, y, extent))
            continue

        const fx = x / stepX - .5
        const fy = y / stepY - .5
        const column = Math.floor(fx)
        const row = Math.floor(fy)

        const tx = fx - column
        const ty = fy - row

        for (const [dx, dy, weight] of [
            [0, 0, (1 - tx) * (1 - ty)],
            [1, 0, tx * (1 - ty)],
            [0, 1, (1 - tx) * ty],
            [1, 1, tx * ty]
        ]) {
            const index = clamp(row + dy, 0, rows - 1) * columns + clamp(column + dx, 0, columns - 1)

            sources[index] += point.value * weight
        }
    }

    return sources
}