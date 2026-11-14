import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItem from '@/types/RenderItem'
import HoverProgress from '@/types/HoverProgress'

describe('Morphing rectangle', () => {
    it('Should not morph from a different shape', () => {
        expect(new RenderItemRectangle().morphFrom({} as never, 1))
            .toBe(false)
    })

    it('Should take the previous position and radii', () => {
        const previous = new RenderItemRectangle()

        previous.absolute = { x: 100, y: 200, width: 300, height: 400 }
        previous.radii = [1, 2, 3, 4]

        const target = new RenderItemRectangle()

        expect(target.morphFrom(previous, 1))
            .toBe(true)
        expect(target.from)
            .toEqual({ x: 100, y: 200, width: 300, height: 400 })
        expect(target.fromRadii)
            .toEqual([1, 2, 3, 4])
    })
})

describe('Appearing rectangle', () => {
    it('Should collapse the rectangle from zero width and height', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 10, y: 20, width: 100, height: 50 }

        expect(shape.appear())
            .toBe(true)
        expect(shape.from)
            .toEqual({ x: 10, y: 20, width: 0, height: 0 })
    })

    it('Should collapse width only and map the entry position', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 10, y: 20, width: 100, height: 50 }
        shape.collapse = { width: true, height: false }
        shape.appear(y => y * 2)

        expect(shape.from)
            .toEqual({ x: 10, y: 40, width: 0, height: 50 })
    })
})

describe('Disappearing rectangle', () => {
    it('Should collapse the rectangle while keeping the previous position', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 10, y: 20, width: 100, height: 50 }
        shape.from = { x: 0, y: 0, width: 0, height: 0 }

        expect(shape.disappear(0))
            .toBe(true)
        expect(shape.from)
            .toEqual({ x: 0, y: 0, width: 0, height: 0 })
        expect(shape.absolute.width)
            .toBe(0)
        expect(shape.absolute.height)
            .toBe(0)
    })

    it('Should move to the mapped axis', () => {
        const shape = new RenderItemRectangle()

        shape.absolute = { x: 10, y: 20, width: 100, height: 50 }
        shape.disappear(1, y => y + 100)

        expect(shape.absolute.y)
            .toBe(120)
    })
})

describe('Animating rectangle hover', () => {
    it('Should dim the item alpha while hovering', () => {
        jest.replaceProperty(HoverProgress, 'isInstant', true)

        const shape = new RenderItemRectangle()
        const item = new RenderItem(shape)

        shape.animate(item, false, 0)

        expect(item.animation.alpha)
            .toBe(.5)

        shape.animate(item, true, 0)

        expect(item.animation.alpha)
            .toBe(1)
    })
})
