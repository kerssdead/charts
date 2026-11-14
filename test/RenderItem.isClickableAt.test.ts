import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Panel from '@/types/Panel'

const POINT = { x: 50, y: 50 }

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

const scrollable = () => {
    const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

    panel.scroll = { top: 0, height: 100 }
    panel.baseHeight = 50
    panel.clip = { x: 0, y: 0, width: 10, height: 10 }

    const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

    item.panel = panel
    item.isScrollable = true

    return item
}

describe('Clicking item at point', () => {
    it('Should be clickable when a click handler is set', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.onClick = () => undefined

        expect(item.isClickableAt(POINT, false))
            .toBe(true)
    })

    it('Should not be clickable without a click handler', () => {
        expect(createItem(shape({ isMouseOver: jest.fn(() => true) })).isClickableAt(POINT, false))
            .toBe(false)
    })

    it('Should not be clickable while initializing', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.onClick = () => undefined
        item.animation.initDuration = 300

        expect(item.isClickableAt(POINT, false))
            .toBe(false)
    })

    it('Should not be clickable while the context menu is open', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.onClick = () => undefined

        expect(item.isClickableAt(POINT, true))
            .toBe(false)
    })

    it('Should stay clickable for a menu button with an open context menu', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.onClick = () => undefined
        item.isMenuButton = true

        expect(item.isClickableAt(POINT, true))
            .toBe(true)
    })

    it('Should not be clickable outside of the item', () => {
        const item = createItem(shape())

        item.onClick = () => undefined

        expect(item.isClickableAt(POINT, false))
            .toBe(false)
    })
})

describe('Checking context menu at point', () => {
    it('Should hit items with a context menu', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.hasContextMenu = true

        expect(item.hasContextMenuAt(POINT))
            .toBe(true)

        item.hasContextMenu = false

        expect(item.hasContextMenuAt(POINT))
            .toBe(false)
    })

    it('Should not hit items while they are initializing', () => {
        const item = createItem(shape({ isMouseOver: jest.fn(() => true) }))

        item.hasContextMenu = true
        item.animation.initDuration = 300

        expect(item.hasContextMenuAt(POINT))
            .toBe(false)
    })
})

describe('Checking item hit', () => {
    it('Should respect the scroll panel clip', () => {
        const item = scrollable()

        expect(item.in({ x: 50, y: 50 }))
            .toBe(false)
        expect(item.in({ x: 5, y: 5 }))
            .toBe(true)
    })
})
