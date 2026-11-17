import { boundsOverlap } from '@/helpers/Bounds'

describe('Checking bounds overlap', () => {
    const AREA = { x: 10, y: 10, width: 100, height: 100 }

    it('Should accept bounds that intersect the area', () => {
        expect(boundsOverlap({ left: 0, top: 0, right: 20, bottom: 20 }, AREA))
            .toBe(true)
    })

    it('Should reject bounds outside the area', () => {
        expect(boundsOverlap({ left: 0, top: 0, right: 5, bottom: 5 }, AREA))
            .toBe(false)
    })
})
