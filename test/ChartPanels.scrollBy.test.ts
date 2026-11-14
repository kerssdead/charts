import ChartPanels from '@/renderer/ChartPanels'
import Layout from '@/renderer/Layout'
import Queue from '@/render/Queue'
import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'

const panel = () => {
    const result = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

    result.clip = { x: 0, y: 0, width: 100, height: 100 }
    result.baseHeight = 50
    result.scroll = { top: 0, height: 200 }
    Object.assign(result, { window: new CanvasWindow(100, 100) })

    return result
}

const panels = () => {
    return new ChartPanels(new Queue({} as CanvasRenderingContext2D), new Layout())
}

describe('Checking chart panels scroll', () => {
    it('Should not scroll without scrollable panels', () => {
        const target = panels()

        expect(target.canScroll)
            .toBe(false)
        expect(target.scrollBy({ x: 1, y: 1 }, 10))
            .toBeNull()
        expect(target.getScrollDrag({ x: 1, y: 1 }))
            .toBeNull()
    })

    it('Should scroll the panel under the point', () => {
        const target = panels()
        const scrollable = panel()

        target.list = [scrollable]

        expect(target.canScroll)
            .toBe(true)
        expect(target.scrollBy({ x: 50, y: 50 }, 20))
            .toBe(true)
        expect(scrollable.target)
            .toBe(20)
    })

    it('Should animate scrolling panels', () => {
        const target = panels()
        const scrollable = panel()

        scrollable.target = 40
        target.list = [scrollable]

        expect(target.animate(1000, new CanvasWindow(100, 100)))
            .toBe(true)

        scrollable.offset = scrollable.target

        expect(target.animate(2000, new CanvasWindow(100, 100)))
            .toBe(false)
    })

    it('Should return a drag for the panel under the point', () => {
        const target = panels()

        target.list = [panel()]

        expect(typeof target.getScrollDrag({ x: 50, y: 50 }))
            .toBe('function')
    })
})

describe('Clearing chart panels', () => {
    it('Should drop the panel list', () => {
        const target = panels()

        target.list = [panel()]

        target.clear()

        expect(target.list)
            .toEqual([])
    })
})
