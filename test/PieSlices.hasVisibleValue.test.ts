import { hasVisibleValue } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Checking sector visible value', () => {
    it('Should be true for enabled sector with positive value', () => {
        expect(hasVisibleValue(new Sector({ value: 1 })))
            .toBe(true)
    })

    it('Should be false for zero and negative values', () => {
        expect(hasVisibleValue(new Sector({ value: 0 })))
            .toBe(false)
        expect(hasVisibleValue(new Sector({ value: -1 })))
            .toBe(false)
    })

    it('Should be false for disabled sector', () => {
        expect(hasVisibleValue(new Sector({ value: 1, disabled: true })))
            .toBe(false)
    })
})