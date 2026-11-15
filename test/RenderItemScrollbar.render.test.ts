import RenderItemScrollbar from '@/types/RenderItemScrollbar'
import RenderItem from '@/types/RenderItem'
import Panel from '@/types/Panel'
import { LIGHT_THEME } from '@/Theme'

const THEME = { ...LIGHT_THEME, text: '#123456' }

const panel = () => {
    const result = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

    result.clip = { x: 0, y: 0, width: 100, height: 100 }
    result.baseHeight = 50
    result.scroll = { top: 0, height: 100 }
    result.offset = 0

    return result
}

const context = () => ({
    roundRect: jest.fn(),
    fill: jest.fn()
})

describe('Scrollbar default color', () => {
    it('Should be the text color with low alpha', () => {
        expect(new RenderItemScrollbar(panel()).defaultColor(THEME))
            .toBe('#1234564d')
    })
})

describe('Adjusting scrollbar', () => {
    it('Should keep the thumb when the panel can scroll', () => {
        const scrollbar = new RenderItemScrollbar(panel())

        scrollbar.adjust()

        expect(scrollbar.getBounds())
            .toEqual({ left: 94, top: 0, right: 98, bottom: 50 })
    })

    it('Should have no thumb when the panel cannot scroll', () => {
        const scrollbar = new RenderItemScrollbar(new Panel(0, { x: 0, y: 0, width: 1, height: 1 }))

        scrollbar.adjust()

        expect(scrollbar.getBounds())
            .toBeNull()
    })
})

describe('Rendering scrollbar', () => {
    it('Should draw a rounded thumb', () => {
        const scrollbar = new RenderItemScrollbar(panel())

        scrollbar.adjust()

        const ctx = context()

        scrollbar.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(scrollbar))

        expect(ctx.roundRect)
            .toHaveBeenCalledWith(94, 0, 4, 50, 2)
        expect(ctx.fill)
            .toHaveBeenCalledTimes(1)
    })

    it('Should not draw when there is no thumb', () => {
        const scrollbar = new RenderItemScrollbar(new Panel(0, { x: 0, y: 0, width: 1, height: 1 }))

        scrollbar.adjust()

        const ctx = context()

        scrollbar.render(ctx as unknown as CanvasRenderingContext2D, new RenderItem(scrollbar))

        expect(ctx.fill)
            .not.toHaveBeenCalled()
    })
})
