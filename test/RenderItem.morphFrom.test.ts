import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import { MorphFade } from '@/static/Enums'
import { ItemFlag as f } from '@/static/ItemFlag'

const shape = (overrides: Partial<RenderItemBase> = {}) => {
    return {
        adjust: jest.fn(),
        render: jest.fn(),
        animate: jest.fn(),
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

describe('Morphing item from previous', () => {
    it('Should do nothing when the shape cannot morph', () => {
        const target = shape()
        const item = createItem(target)

        item.morphFrom(createItem(), 100)

        expect(item.animation.isMorphing)
            .toBe(false)
        expect(target.morphFrom)
            .toHaveBeenCalled()
    })

    it('Should morph from the previous shape', () => {
        const target = shape({ morphFrom: jest.fn(() => true) })
        const item = createItem(target)

        item.morphFrom(createItem(), 100)

        expect(item.animation.isMorphing)
            .toBe(true)
        expect(item.animation.morphFade)
            .toBeNull()
    })

    it('Should fade in when the previous item is a ghost', () => {
        const previous = createItem()

        previous.set(f.Ghost, true)

        const item = createItem(shape({ morphFrom: jest.fn(() => true) }))

        item.morphFrom(previous, 100)

        expect(item.animation.morphFade)
            .toBe(MorphFade.In)
    })

    it('Should fade out when the item itself is a ghost', () => {
        const item = createItem(shape({ morphFrom: jest.fn(() => true) }))

        item.set(f.Ghost, true)
        item.morphFrom(createItem(), 100)

        expect(item.animation.morphFade)
            .toBe(MorphFade.Out)
    })
})

describe('Appearing item', () => {
    it('Should start initialization when the shape has no appear animation', () => {
        const item = createItem()

        item.appear(100)

        expect(item.animation.isInitializing)
            .toBe(true)
        expect(item.animation.isLeaving)
            .toBe(false)
    })

    it('Should use the duration of the item when it has its own', () => {
        const item = createItem()

        item.animation.appearDuration = 900
        item.appear(100)

        expect(item.animation.initDuration)
            .toBe(900)
    })

    it('Should use the own duration of the item when morphing in', () => {
        const item = createItem(shape({ appear: jest.fn(() => true) }))

        item.animation.appearDuration = 900
        item.appear(100)

        expect(item.animation.morphDuration)
            .toBe(900)
    })

    it('Should use the transition duration without an own one', () => {
        const item = createItem()

        item.appear(100)

        expect(item.animation.initDuration)
            .toBe(100)
    })

    it('Should morph in when the shape can appear', () => {
        const item = createItem(shape({ appear: jest.fn(() => true) }))

        item.appear(100)

        expect(item.animation.isMorphing)
            .toBe(true)
        expect(item.animation.morphFade)
            .toBe(MorphFade.In)
    })
})

describe('Disappearing item', () => {
    it('Should start leaving initialization when the shape cannot disappear', () => {
        const item = createItem()

        item.disappear(100)

        expect(item.animation.isInitializing)
            .toBe(true)
        expect(item.animation.isLeaving)
            .toBe(true)
    })

    it('Should morph out when the shape can disappear', () => {
        const item = createItem(shape({ disappear: jest.fn(() => true) }))

        item.disappear(100)

        expect(item.animation.isMorphing)
            .toBe(true)
        expect(item.animation.morphFade)
            .toBe(MorphFade.Out)
        expect(item.animation.removeAfterMorph)
            .toBe(true)
    })
})

describe('Moving item along the axis', () => {
    it('Should start initialization when the shape cannot enter from axis', () => {
        const item = createItem()

        item.enterFromAxis(50, 100)

        expect(item.animation.isInitializing)
            .toBe(true)
    })

    it('Should morph in when the shape can enter from axis', () => {
        const item = createItem(shape({ enterFromAxis: jest.fn(() => true) }))

        item.enterFromAxis(50, 100)

        expect(item.animation.morphFade)
            .toBe(MorphFade.In)
    })

    it('Should start leaving initialization when the shape cannot leave to axis', () => {
        const item = createItem()

        item.leaveToAxis(50, 100)

        expect(item.animation.isInitializing)
            .toBe(true)
        expect(item.animation.isLeaving)
            .toBe(true)
    })

    it('Should morph out when the shape can leave to axis', () => {
        const item = createItem(shape({ leaveToAxis: jest.fn(() => true) }))

        item.leaveToAxis(50, 100)

        expect(item.animation.morphFade)
            .toBe(MorphFade.Out)
        expect(item.animation.removeAfterMorph)
            .toBe(true)
    })
})

describe('Stepping the hover factor', () => {
    it('Should grow when hovering and shrink when leaving', () => {
        const item = createItem()

        item.isInstant = true

        expect(item.hoverFactor(false, 100, 200))
            .toBe(1)
        expect(item.hoverFactor(true, 100, 200))
            .toBe(0)
    })
})
