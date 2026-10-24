import { getMiddleAngle, PieSlice } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Getting slice middle angle', () => {
    it('Should return angle in the middle of slice', () => {
        const slice: PieSlice = { sector: new Sector(), key: '0', startAngle: 1, angle: 2 }

        expect(getMiddleAngle(slice))
            .toBe(2)
    })

    it('Should return start angle for empty slice', () => {
        const slice: PieSlice = { sector: new Sector(), key: '0', startAngle: 1.5, angle: 0 }

        expect(getMiddleAngle(slice))
            .toBe(1.5)
    })
})