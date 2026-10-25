import Units from '@/helpers/Units'
import { sum } from '@/helpers/Collections'
import RectangleDimensions from '@/types/RectangleDimensions'

export type Cell<T> = {
    value: T
    box: RectangleDimensions
}

export function getPositiveSortedDescending<T>(values: T[], getValue: (value: T) => number) {
    return values.filter(value => getValue(value) > 0)
                 .sort((a, b) => getValue(b) - getValue(a))
}

export function getCells<T>(
    values: T[],
    box: RectangleDimensions,
    getValue: (value: T) => number,
    units: Units,
    gap: number
): Cell<T>[] {
    const right = box.x + box.width
    const bottom = box.y + box.height

    const areaPerUnit = box.width * box.height / sum(values, getValue)

    const cursor = { x: box.x, y: box.y }

    return values.map((value, index) => {
        const { x, y } = cursor

        const isColumn = units.toPxX(right - x) >= units.toPxY(bottom - y)
        const isLast = index + 1 == values.length

        const area = getValue(value) * areaPerUnit

        const width = isColumn ? (area / (bottom - y)) : (right - x)
        const height = isColumn ? (bottom - y) : (area / (right - x))

        if (isColumn) {
            cursor.x += width
        } else {
            cursor.y += height
        }

        const widthGap = isColumn && !isLast ? units.x(gap) : 0
        const heightGap = isColumn || isLast ? 0 : units.y(gap)

        return {
            value,
            box: { x, y, width: Math.max(width - widthGap, 0), height: Math.max(height - heightGap, 0) }
        }
    })
}