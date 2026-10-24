import PieSizing from '@/render/pie/PieSizing'
import Units from '@/helpers/Units'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { HOVER_OFFSET } from '@/types/RenderItemArc'

jest.mock('@/Theme', () => ({}))

const create = (width: number, height: number, innerRadiusPercent: number = 0) =>
    new PieSizing(new Units({ x: COORDS_MAX_X / width, y: COORDS_MAX_Y / height }), innerRadiusPercent)

describe('Creating pie sizing', () => {
    it('Should fit radius to a fifth of width and show labels on normal canvas', () => {
        const sizing = create(800, 600)

        expect(sizing.radius)
            .toBeCloseTo(155.2)
        expect(sizing.areLabelsHidden)
            .toBe(false)
        expect(sizing.labelDistance)
            .toBeCloseTo(155.2 + 16)
        expect(sizing.labelBounds)
            .toEqual({ x: 388 - HOVER_OFFSET, y: 288 - HOVER_OFFSET })
    })

    it('Should fit radius to height and show labels on wide canvas', () => {
        const sizing = create(1000, 100)

        expect(sizing.radius)
            .toBeCloseTo(28)
        expect(sizing.areLabelsHidden)
            .toBe(false)
    })

    it('Should fit radius to width and show labels on tall canvas', () => {
        const sizing = create(100, 1000)

        expect(sizing.radius)
            .toBeCloseTo(28)
        expect(sizing.areLabelsHidden)
            .toBe(false)
    })

    it('Should hide labels and keep minimal radius on small canvas', () => {
        const sizing = create(200, 200)

        expect(sizing.radius)
            .toBe(40)
        expect(sizing.areLabelsHidden)
            .toBe(true)
    })

    it('Should hide labels and not go below zero radius on tiny wide canvas', () => {
        const sizing = create(150, 40)

        expect(sizing.radius)
            .toBe(0)
        expect(sizing.areLabelsHidden)
            .toBe(true)
    })

    it('Should clamp inner radius ratio', () => {
        expect(create(800, 600, 50).innerRadiusRatio)
            .toBe(.5)
        expect(create(800, 600, 150).innerRadiusRatio)
            .toBe(1)
        expect(create(800, 600, -10).innerRadiusRatio)
            .toBe(0)
        expect(create(800, 600, NaN).innerRadiusRatio)
            .toBe(0)
    })
})