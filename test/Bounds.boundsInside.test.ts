import { boundsInside } from '@/helpers/Bounds'

describe('Checking bounds inside an area', () => {
    const AREA = { x: 10, y: 10, width: 100, height: 100 }

    it('Should accept bounds inside the area', () => {
        expect(boundsInside({ left: 20, top: 20, right: 80, bottom: 80 }, AREA))
            .toBe(true)
    })

    it('Should reject bounds that overlap the area edge', () => {
        expect(boundsInside({ left: 10, top: 20, right: 80, bottom: 80 }, AREA))
            .toBe(false)
    })
})
