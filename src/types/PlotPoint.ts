import ItemData from '@/types/ItemData'

type PlotPoint = {
    x: number | Date | string

    y: number | Date | string | null

    label?: string

    data?: ItemData
}

export function getY(point: PlotPoint): number | null {
    return point.y == null ? null : Number(point.y)
}

export function getPointKeys(points: PlotPoint[]): string[] {
    const counts = new Map<string, number>()

    return points.map(point => {
        const x = String(point.x instanceof Date ? point.x.getTime() : point.x)
        const count = counts.get(x) ?? 0

        counts.set(x, count + 1)

        return `${ x }-${ count }`
    })
}

export default PlotPoint