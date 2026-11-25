import { getBounds } from '@/render/heatMap/HeatMapLayout'

const MARGINS = { left: 10, top: 20, right: 30, bottom: 40 }

describe('Getting bounds inside margins', () => {
    it('Should leave the space between the margins', () => {
        expect(getBounds(200, 300, MARGINS))
            .toEqual({ x: 10, y: 20, width: 160, height: 240 })
    })

    it('Should keep at least one pixel', () => {
        expect(getBounds(20, 30, MARGINS))
            .toEqual({ x: 10, y: 20, width: 1, height: 1 })
    })
})