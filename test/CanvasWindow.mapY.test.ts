import CanvasWindow from '@/types/CanvasWindow'

describe('Mapping y to canvas', () => {
    it('Should map coordinate range onto window height', () => {
        const window = new CanvasWindow(100, 200)

        expect([window.mapY(0), window.mapY(2500), window.mapY(5000)])
            .toEqual([0, 100, 200])
    })

    it('Should shift by window position', () => {
        const window = new CanvasWindow(100, 200)

        window.fit(0, 40, 100, 200)

        expect(window.mapY(2500))
            .toBe(140)
    })

    it('Should round to whole pixels', () => {
        expect(new CanvasWindow(3, 3).mapY(2500))
            .toBe(2)
    })
})