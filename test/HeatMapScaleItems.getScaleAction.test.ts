import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemField from '@/types/RenderItemField'
import RenderItemText from '@/types/RenderItemText'
import Units from '@/helpers/Units'
import { getScaleAction } from '@/render/heatMap/HeatMapScaleItems'
import {
    LABEL_GAP,
    PADDING,
    SCALE_BAR_HEIGHT,
    SCALE_HEIGHT,
    SCALE_SAMPLES,
    SCALE_WIDTH
} from '@/render/heatMap/HeatMapConstants'

const UNITS = new Units({ x: 5, y: 5 })

const LUT = new Uint32Array(256)

const build = (area = { x: 100, y: 50, width: 800, height: 400 }) => {
    const action = getScaleAction({ units: UNITS, area, height: 600, minText: '0', maxText: '99', lut: LUT })

    return new Map(QueueItemsBuilder.build(action).map(item => [item.key ?? '', item]))
}

const TOP = 600 - PADDING - SCALE_HEIGHT

describe('Getting the scale action', () => {
    it('Should draw the bar and both end values', () => {
        expect([...build().keys()])
            .toEqual(['heat-scale', 'heat-scale-min', 'heat-scale-max'])
    })

    it('Should put the bar at the bottom starting at the left of the map', () => {
        const { box } = build().get('heat-scale')?.shape as RenderItemField

        expect(box)
            .toEqual({
                x: UNITS.x(100),
                y: UNITS.y(TOP),
                width: UNITS.x(SCALE_WIDTH),
                height: UNITS.y(SCALE_BAR_HEIGHT)
            })
    })

    it('Should be as wide as a narrow map', () => {
        const { box } = build({ x: 10, y: 0, width: 120, height: 100 }).get('heat-scale')?.shape as RenderItemField

        expect(box.width)
            .toBe(UNITS.x(120))
    })

    it('Should fill the bar with a ramp from 0 to 1', () => {
        const { field } = build().get('heat-scale')?.shape as RenderItemField

        expect([field?.columns, field?.rows, field?.min, field?.max])
            .toEqual([SCALE_SAMPLES, 1, 0, 1])
        expect(field?.values[0])
            .toBe(0)
        expect(field?.values[SCALE_SAMPLES - 1])
            .toBe(1)
        expect(field?.lut)
            .toBe(LUT)
    })

    it('Should write the lowest value under the left end', () => {
        const text = build().get('heat-scale-min')?.shape as RenderItemText

        expect(text.value)
            .toBe('0')
        expect(text.absolute)
            .toEqual({ x: UNITS.x(100), y: UNITS.y(TOP + SCALE_BAR_HEIGHT + LABEL_GAP) })
    })

    it('Should write the highest value under the right end', () => {
        const text = build().get('heat-scale-max')?.shape as RenderItemText

        expect(text.value)
            .toBe('99')
        expect(text.absolute.x)
            .toBe(UNITS.x(100 + SCALE_WIDTH))
    })
})