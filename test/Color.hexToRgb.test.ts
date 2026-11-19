import { hexToRgb } from '@/helpers/Color'

describe('Converting hex to rgb', () => {
    it('Should parse a six digit hex', () => {
        expect(hexToRgb('#102030'))
            .toEqual({ r: 16, g: 32, b: 48 })
    })

    it('Should parse hex without a hash', () => {
        expect(hexToRgb('102030'))
            .toEqual({ r: 16, g: 32, b: 48 })
    })

    it('Should expand short hex', () => {
        expect(hexToRgb('#f08'))
            .toEqual({ r: 255, g: 0, b: 136 })
    })

    it('Should ignore alpha', () => {
        expect(hexToRgb('#10203040'))
            .toEqual({ r: 16, g: 32, b: 48 })
        expect(hexToRgb('#f08a'))
            .toEqual({ r: 255, g: 0, b: 136 })
    })

    it('Should be case insensitive', () => {
        expect(hexToRgb('#FFaa00'))
            .toEqual({ r: 255, g: 170, b: 0 })
    })

    it('Should give null for invalid input', () => {
        expect(hexToRgb('red'))
            .toBeNull()
        expect(hexToRgb('#12345'))
            .toBeNull()
        expect(hexToRgb(''))
            .toBeNull()
    })
})