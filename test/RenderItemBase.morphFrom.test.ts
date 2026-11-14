import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'

class DummyShape extends RenderItemBase {
    adjust(): void {
    }

    render(): void {
    }
}

describe('Default render item shape behavior', () => {
    const shape = new DummyShape()

    it('Should not animate hover', () => {
        expect(shape.animateHover({ x: 1, y: 1 }, 0))
            .toBe(false)
    })

    it('Should not hover anywhere', () => {
        expect(shape.isMouseOver({ x: 1, y: 1 }))
            .toBe(false)
    })

    it('Should not have a tooltip', () => {
        expect(shape.tooltipAt({ x: 1, y: 1 }))
            .toBeNull()
    })

    it('Should have no default color', () => {
        expect(shape.defaultColor)
            .toBeUndefined()
    })

    it('Should have no bounds', () => {
        expect(shape.getBounds())
            .toBeNull()
    })

    it('Should not morph from other shapes', () => {
        expect(shape.morphFrom(new DummyShape(), 1))
            .toBe(false)
    })

    it('Should not appear', () => {
        expect(shape.appear())
            .toBe(false)
    })

    it('Should not disappear', () => {
        expect(shape.disappear(1))
            .toBe(false)
    })

    it('Should not enter from axis', () => {
        expect(shape.enterFromAxis(1))
            .toBe(false)
    })

    it('Should not leave to axis', () => {
        expect(shape.leaveToAxis(1, 1))
            .toBe(false)
    })

    it('Should ignore hover animation', () => {
        shape.animate(new RenderItem(shape), false, 0)
    })
})
