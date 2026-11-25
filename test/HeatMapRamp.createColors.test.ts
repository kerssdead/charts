import { createColors } from '@/render/heatMap/HeatMapRamp'
import { LUT_SIZE } from '@/render/heatMap/HeatMapConstants'

describe('Creating a color table', () => {
    it('Should have one color for every level', () => {
        expect(createColors(() => '#000000'))
            .toHaveLength(LUT_SIZE)
    })

    it('Should sample the ramp from 0 to 1', () => {
        const ratios: number[] = []

        createColors(ratio => {
            ratios.push(ratio)

            return '#000000'
        })

        expect(ratios[0])
            .toBe(0)
        expect(ratios[ratios.length - 1])
            .toBe(1)
        expect(ratios[1])
            .toBeCloseTo(1 / (LUT_SIZE - 1))
    })

    it('Should keep the colors in order', () => {
        const colors = createColors(ratio => ratio < .5 ? '#000000' : '#ffffff')

        expect(colors[0])
            .toBe('#000000')
        expect(colors[LUT_SIZE - 1])
            .toBe('#ffffff')
    })
})