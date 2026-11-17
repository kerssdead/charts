import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import Panel from '@/types/Panel'
import ValueAxis from '@/types/ValueAxis'

export const DURATION = 300

export const axis = (isHorizontal: boolean = false, scale: number = 10): ValueAxis => ({
    isHorizontal,
    getAxisY: value => value * scale,
    getAxisValue: y => y / scale
})

export const panel = (index: number, valueAxis?: ValueAxis) => ({ index, valueAxis }) as unknown as Panel

export const panelsWithAxis = (valueAxis?: ValueAxis) => [panel(0, valueAxis)]

export const createQueue = () => {
    return new Queue({ setTransform: jest.fn(), fillRect: jest.fn() } as unknown as CanvasRenderingContext2D)
}

export const createItem = (
    key: string | null,
    shape: RenderItemBase = new RenderItemRectangle(),
    itemPanel: Panel | null = null
) => {
    const item = new RenderItem(shape)

    item.key = key
    item.panel = itemPanel

    return item
}
