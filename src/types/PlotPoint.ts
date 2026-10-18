import ItemData from '@/types/ItemData'

type PlotPoint = {
    x: number | Date | string

    y: number | Date | string

    label?: string

    data?: ItemData
}

export default PlotPoint