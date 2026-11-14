import CanvasWindow from '@/types/CanvasWindow'

describe('Mapping x to canvas', () => {
    it('Should map coordinate range onto window width', () => {
        const window = new CanvasWindow(200, 100)

        expect([window.mapX(0), window.mapX(2500), window.mapX(5000)])
            .toEqual([0, 100, 200])
    })

    it('Should shift by window position', () => {
        const window = new CanvasWindow(200, 100)

        window.fit(30, 0, 200, 100)

        expect(window.mapX(2500))
            .toBe(130)
    })

    it('Should round to whole pixels', () => {
        expect(new CanvasWindow(3, 3).mapX(2500))
            .toBe(2)
    })
})