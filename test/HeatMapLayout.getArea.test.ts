import { getArea } from '@/render/heatMap/HeatMapLayout'

const BOUNDS = { x: 10, y: 20, width: 100, height: 100 }

describe('Getting the map area', () => {
    it('Should fill the bounds without an extent', () => {
        expect(getArea(BOUNDS, null))
            .toEqual(BOUNDS)
    })

    it('Should fit a wide extent and center it vertically', () => {
        expect(getArea(BOUNDS, { width: 200, height: 100 }))
            .toEqual({ x: 10, y: 45, width: 100, height: 50 })
    })

    it('Should fit a tall extent and center it horizontally', () => {
        expect(getArea(BOUNDS, { width: 100, height: 200 }))
            .toEqual({ x: 35, y: 20, width: 50, height: 100 })
    })

    it('Should scale a small extent up to the bounds', () => {
        expect(getArea(BOUNDS, { width: 10, height: 5 }))
            .toEqual({ x: 10, y: 45, width: 100, height: 50 })
    })

    it('Should keep the aspect ratio of the extent', () => {
        const area = getArea({ x: 0, y: 0, width: 640, height: 480 }, { width: 1200, height: 800 })

        expect(area.width / area.height)
            .toBeCloseTo(1.5, 1)
    })
})