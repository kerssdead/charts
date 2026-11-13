import Units from '@/helpers/Units'
import { sum } from '@/helpers/Collections'
import Point from '@/types/Point'
import RectangleDimensions from '@/types/RectangleDimensions'

export type Cell<T> = {
    value: T
    box: RectangleDimensions
}

type Item<T> = {
    value: T
    area: number
    pixelArea: number
}

type Row = {
    start: number
    end: number
    isColumn: boolean
    isLast: boolean
    thickness: number
}

type RowAreas = {
    total: number
    largest: number
    smallest: number
}

export type CellArea = {
    box: RectangleDimensions
    units: Units
    gap: number
}

export function getPositiveSortedDescending<T>(values: T[], getValue: (value: T) => number) {
    return values.filter(value => getValue(value) > 0)
                 .sort((a, b) => getValue(b) - getValue(a))
}

export function getCells<T>(values: T[], getValue: (value: T) => number, area: CellArea): Cell<T>[] {
    const { box, units, gap } = area
    const areaPerValue = box.width * box.height / sum(values, getValue)

    const items = values.map(value => {
        const area = getValue(value) * areaPerValue

        return { value, area, pixelArea: units.toPxX(units.toPxY(area)) }
    })

    const gapSize = { x: units.x(gap), y: units.y(gap) }

    const cells: Cell<T>[] = []

    let remaining = box

    while (cells.length < items.length) {
        const row = getRow(items, cells.length, remaining, units)

        cells.push(...getRowCells(items, row, remaining, gapSize))

        remaining = getRemainingBox(remaining, row)
    }

    return cells
}

function getRow<T>(items: Item<T>[], start: number, remaining: RectangleDimensions, units: Units): Row {
    const isColumn = units.toPxX(remaining.width) >= units.toPxY(remaining.height)
    const side = isColumn ? units.toPxY(remaining.height) : units.toPxX(remaining.width)

    const end = start + getRowItemCount(items, start, side)

    const area = sum(items.slice(start, end), item => item.area)
    const thickness = area / (isColumn ? remaining.height : remaining.width)

    return { start, end, isColumn, isLast: end === items.length, thickness }
}

function getRowItemCount<T>(items: Item<T>[], start: number, side: number) {
    const first = items[start].pixelArea

    let row = { total: first, largest: first, smallest: first }
    let count = 1

    while (start + count < items.length) {
        const area = items[start + count].pixelArea

        const next = {
            total: row.total + area,
            largest: Math.max(row.largest, area),
            smallest: Math.min(row.smallest, area)
        }

        if (getWorstAspectRatio(next, side) >= getWorstAspectRatio(row, side))
            break

        row = next
        count++
    }

    return count
}

function getWorstAspectRatio({ total, largest, smallest }: RowAreas, side: number) {
    const sideSquared = side * side
    const totalSquared = total * total

    return Math.max(sideSquared * largest / totalSquared, totalSquared / (sideSquared * smallest))
}

function getRowCells<T>(
    items: Item<T>[],
    { start, end, isColumn, isLast, thickness }: Row,
    remaining: RectangleDimensions,
    gap: Point
): Cell<T>[] {
    let offset = isColumn ? remaining.y : remaining.x

    return items.slice(start, end).map(({ value, area }, index) => {
        const cellLength = area / thickness
        const isLastInRow = start + index + 1 === end

        const x = isColumn ? remaining.x : offset
        const y = isColumn ? offset : remaining.y

        const width = isColumn ? thickness : cellLength
        const height = isColumn ? cellLength : thickness

        const hasWidthGap = isColumn ? !isLast : !isLastInRow
        const hasHeightGap = isColumn ? !isLastInRow : !isLast

        offset += cellLength

        return {
            value,
            box: {
                x,
                y,
                width: Math.max(width - (hasWidthGap ? gap.x : 0), 0),
                height: Math.max(height - (hasHeightGap ? gap.y : 0), 0)
            }
        }
    })
}

function getRemainingBox(box: RectangleDimensions, { isColumn, thickness }: Row): RectangleDimensions {
    return isColumn
           ? { ...box, x: box.x + thickness, width: box.width - thickness }
           : { ...box, y: box.y + thickness, height: box.height - thickness }
}