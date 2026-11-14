import CanvasWindow from '@/types/CanvasWindow'

describe('Canvas window', () => {
    it('Should report resize only when size changes', () => {
        const window = new CanvasWindow(100, 100)

        expect(window.fit(10, 20, 200, 100))
            .toBe(true)
        expect(window.fit(10, 20, 200, 100))
            .toBe(false)
        expect([window.x, window.y, window.width, window.height])
            .toEqual([10, 20, 200, 100])
    })

    it('Should keep pan offset after fit', () => {
        const window = new CanvasWindow(100, 100)

        window.moveTo(30, 0)
        window.fit(10, 0, 100, 100)

        expect(window.x)
            .toBe(40)
    })

    it('Should zoom around anchor', () => {
        const window = new CanvasWindow(100, 100)

        window.zoom(.5, { x: 50, y: 50 })

        expect([window.x, window.y, window.width, window.height])
            .toEqual([-25, -25, 150, 150])
    })

    it('Should not zoom beyond limits', () => {
        const window = new CanvasWindow(100, 100)

        window.zoom(1, { x: 0, y: 0 })
        window.zoom(1, { x: 0, y: 0 })

        expect(window.width)
            .toBe(150)

        window.zoom(-.9, { x: 0, y: 0 })

        expect(window.width)
            .toBe(50)
    })

    it('Should keep part of window visible when panning', () => {
        const window = new CanvasWindow(100, 100)

        window.moveTo(1000, -1000)

        expect([window.x, window.y])
            .toEqual([75, -75])
    })
})