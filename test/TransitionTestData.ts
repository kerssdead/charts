import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Panel from '@/types/Panel'
import ValueAxis from '@/types/ValueAxis'
import Rectangle from '@/helpers/Rectangle'

export const DURATION = 300

export class FakeShape extends RenderItemBase {
    calls: string[] = []

    appearMapY?: (y: number) => number

    disappearMapY?: (y: number) => number

    isAnimated: boolean

    constructor(isAnimated: boolean = true) {
        super()

        this.isAnimated = isAnimated
    }

    adjust() {}

    render() {}

    morphFrom(previous: RenderItemBase) {
        this.calls.push(previous instanceof FakeShape ? 'morphFrom' : 'morphFromOther')

        return this.isAnimated
    }

    appear(mapY?: (y: number) => number) {
        this.calls.push('appear')
        this.appearMapY = mapY

        return this.isAnimated
    }

    disappear(_morph: number, mapY?: (y: number) => number) {
        this.calls.push('disappear')
        this.disappearMapY = mapY

        return this.isAnimated
    }

    enterFromAxis(y: number) {
        this.calls.push(`enterFromAxis:${y}`)

        return this.isAnimated
    }

    leaveToAxis(y: number) {
        this.calls.push(`leaveToAxis:${y}`)

        return this.isAnimated
    }
}

export const createItem = (key: string | null, shape: RenderItemBase = new FakeShape()) => {
    const result = new RenderItem(shape)

    result.key = key

    return result
}

export const createQueue = (items: RenderItem[] = []) => {
    const queue = new Queue({} as CanvasRenderingContext2D)

    queue.add(items)

    return queue
}

export const createAxis = (scale: number, isHorizontal: boolean = false): ValueAxis => ({
    isHorizontal,
    getAxisY: value => value * scale,
    getAxisValue: y => y / scale
})

export const createPanel = (index: number, valueAxis: ValueAxis | null = null) => {
    const result = new Panel(index, Rectangle.empty())

    result.valueAxis = valueAxis

    return result
}