import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'

const shape = (overrides: Partial<RenderItemBase> = {}) => {
    const animate = jest.fn((item: RenderItem, isBackward: boolean, now: DOMHighResTimeStamp) => {
        item.hoverFactor(isBackward, now, 450)
    })

    return {
        adjust: jest.fn(),
        render: jest.fn(),
        animate,
        animateHover: jest.fn(() => false),
        isMouseOver: jest.fn(() => false),
        tooltipAt: jest.fn(() => null),
        getBounds: jest.fn(() => null),
        morphFrom: jest.fn(() => false),
        appear: jest.fn(() => false),
        disappear: jest.fn(() => false),
        enterFromAxis: jest.fn(() => false),
        leaveToAxis: jest.fn(() => false),
        ...overrides
    } as unknown as RenderItemBase
}

const createItem = (target = shape()) => new RenderItem(target)

const POINT = { x: 50, y: 50 }

describe('Animating item hover', () => {
    it('Should not animate non-interactive items', () => {
        const target = shape()
        const item = createItem(target)

        expect(item.animate(POINT, 100, new Set()))
            .toBe(false)
        expect(target.animateHover)
            .not.toHaveBeenCalled()
        expect(target.animate)
            .not.toHaveBeenCalled()
    })

    it('Should not animate items while they are initializing', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.isInteractive = true
        item.animation.initDuration = 300

        expect(item.animate(POINT, 100, new Set()))
            .toBe(false)
    })

    it('Should animate the shape of hovered items without a group', () => {
        const target = shape({ isMouseOver: jest.fn(() => true) })
        const item = createItem(target)

        item.isInteractive = true

        expect(item.animate(POINT, 100, new Set()))
            .toBe(true)
        expect(target.animate)
            .toHaveBeenCalledWith(item, false, 100)
    })

    it('Should not animate items outside of the point', () => {
        const target = shape()
        const item = createItem(target)

        item.isInteractive = true

        expect(item.animate(POINT, 100, new Set()))
            .toBe(false)
        expect(target.animate)
            .not.toHaveBeenCalled()
    })

    it('Should not animate the item whose group is hovered', () => {
        const target = shape()
        const item = createItem(target)

        item.isInteractive = true
        item.hoverGroup = 'group'

        expect(item.animate(POINT, 100, new Set(['group'])))
            .toBe(false)
        expect(target.animate)
            .not.toHaveBeenCalled()
    })

    it('Should animate items whose group is not hovered', () => {
        const target = shape()
        const item = createItem(target)

        item.isInteractive = true
        item.hoverGroup = 'group'

        expect(item.animate(POINT, 100, new Set(['other'])))
            .toBe(true)
        expect(target.animate)
            .toHaveBeenCalledWith(item, false, 100)
        expect(item.animate(POINT, 100, new Set()))
            .toBe(false)
    })

    it('Should keep animating the monochrome factor', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.isInteractive = true
        item.isMonochrome = true

        item.animate(POINT, 100, new Set())
        item.animate(POINT, 200, new Set())

        expect(item.animation.mono)
            .toBeGreaterThan(0)
    })

    it('Should return shape animation even when the hover is idle', () => {
        const target = shape({ animateHover: jest.fn(() => true) })
        const item = createItem(target)

        item.isInteractive = true

        expect(item.animate(POINT, 100, new Set()))
            .toBe(true)
    })
})
