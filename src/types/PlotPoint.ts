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

export default PlotPoint