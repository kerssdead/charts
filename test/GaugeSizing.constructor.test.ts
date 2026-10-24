import GaugeSizing from '@/render/gauge/GaugeSizing'
import Units from '@/helpers/Units'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'

const units = (width: number, height: number) => new Units({ x: COORDS_MAX_X / width, y: COORDS_MAX_Y / height })

describe('Creating gauge sizing', () => {
    it('Should fit radius to height and compute ring and center', () => {
        const sizing = new GaugeSizing(units(1000, 400), NaN, [], 2, 1)

        expect(sizing.innerRadiusRatio)
            .toBe(.7)
        expect(sizing.labelAreaHeight)
            .toBe(48)
        expect(sizing.radius)
            .toBeCloseTo(317.2)
        expect(sizing.ringMiddleRadius)
            .toBeCloseTo(317.2 * 1.7 / 2)
        expect(sizing.ringThickness)
            .toBeCloseTo(317.2 * .3)
        expect(sizing.centerInCoords.x)
            .toBe(COORDS_MAX_X / 2)
        expect(sizing.centerInCoords.y)
            .toBeCloseTo(345.6 * COORDS_MAX_Y / 400)
    })

    it('Should split ring thickness between rings', () => {
        expect(new GaugeSizing(units(1000, 400), 70, [], 2, 3).ringThickness)
            .toBeCloseTo(317.2 * .3 / 3)
    })

    it('Should use zero ring thickness without rings', () => {
        expect(new GaugeSizing(units(1000, 400), 70, [], 2, 0).ringThickness)
            .toBe(0)
    })

    it('Should fit radius to half width on tall canvas', () => {
        expect(new GaugeSizing(units(400, 1000), 70, [], 2, 1).radius)
            .toBeCloseTo(193.6)
    })

    it('Should shrink radius to leave room for step labels', () => {
        const steps = [{ angle: Math.PI * 1.25, text: '25', textWidth: 100 }]

        expect(new GaugeSizing(units(400, 1000), 70, steps, 2, 1).radius)
            .toBeCloseTo((193.6 - 100) / Math.SQRT1_2 - 8)
    })

    it('Should not go below zero radius on tiny canvas', () => {
        expect(new GaugeSizing(units(100, 50), 70, [], 2, 1).radius)
            .toBe(0)
    })
})