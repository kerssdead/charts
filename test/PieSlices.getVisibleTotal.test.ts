import { getVisibleTotal } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Getting visible total', () => {
    it('Should sum only enabled positive values', () => {
        const sectors = [
            new Sector({ value: 2 }),
            new Sector({ value: 3 }),
            new Sector({ value: 5, disabled: true }),
            new Sector({ value: -4 }),
            new Sector({ value: 0 })
        ]

        expect(getVisibleTotal(sectors))
            .toBe(5)
    })

    it('Should return 0 for empty array', () => {
        expect(getVisibleTotal([]))
            .toBe(0)
    })
})