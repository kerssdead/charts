import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'

const queue = () => new Queue({} as CanvasRenderingContext2D)

const item = (canHover: boolean, hoverGroup: string | undefined, animates: boolean = false) => {
    return {
        layer: 0,
        hoverGroup,
        canHoverGroupAt: jest.fn(() => canHover),
        animate: jest.fn(() => animates)
    } as unknown as RenderItem
}

describe('Animating queue items', () => {
    it('Should hover the topmost hoverable group', () => {
        const top = item(true, 'group')
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item(false, 'other'), top])

        queue.animate({ x: 10, y: 20 }, 100)

        expect(top.canHoverGroupAt)
            .toHaveBeenCalledWith({ x: 10, y: 20 })
        expect(top.animate.mock.calls[0][2])
            .toBeInstanceOf(Set)
        expect([...(top.animate.mock.calls[0][2] as Set<string>)])
            .toEqual(['group'])
    })

    it('Should animate every item', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const a = item(false, undefined)
        const b = item(false, undefined, true)

        queue.add([a, b])

        expect(queue.animate({ x: 1, y: 2 }, 100))
            .toBe(true)
        expect(a.animate)
            .toHaveBeenCalledWith({ x: 1, y: 2 }, 100, expect.any(Set))
        expect(b.animate)
            .toHaveBeenCalled()
    })

    it('Should report no animation when nothing animates', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item(false, undefined)])

        expect(queue.animate({ x: 1, y: 2 }, 100))
            .toBe(false)
    })

    it('Should hover nothing when no pointer is given', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const item = { layer: 0, canHoverGroupAt: jest.fn(() => true), animate: jest.fn(() => false) } as unknown as RenderItem

        queue.add([item])

        queue.animate(null, 100)

        expect(item.canHoverGroupAt)
            .toHaveBeenCalledWith({ x: -Infinity, y: -Infinity })
    })
})
