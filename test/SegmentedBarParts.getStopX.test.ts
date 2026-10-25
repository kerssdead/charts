import { getStopX, PartsLayout } from '@/render/segmentedBar/SegmentedBarParts'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'

const BAR = { x: 10, y: 0, width: 100, height: 30 }

const LAYOUT: PartsLayout = {
    parts: [
        { sector: new Sector({ value: 1 }), box: { x: 10, y: 0, width: 25, height: 30 } },
        { sector: new Sector({ value: 3 }), box: { x: 35, y: 0, width: 75, height: 30 } }
    ],
    widthPerValue: 25
}

const getX = (value: number | string, layout = LAYOUT) => getStopX(new SegmentedBarStop({ value }), layout, BAR)

describe('Getting segmented bar stop x', () => {
    it('Should place percent stop by bar width', () => {
        expect(getX('50%'))
            .toBe(60)
    })

    it('Should clamp percent stop to bar', () => {
        expect(getX('150%'))
            .toBe(110)
        expect(getX('-10%'))
            .toBe(10)
    })

    it('Should place value stop inside its part', () => {
        expect(getX(1))
            .toBe(35)
        expect(getX(2))
            .toBe(60)
    })

    it('Should place non-positive value stop at bar start', () => {
        expect(getX(0))
            .toBe(10)
        expect(getX(-5))
            .toBe(10)
    })

    it('Should continue past last part by width per value', () => {
        expect(getX(6))
            .toBe(160)
    })

    it('Should place value stop from bar start without parts', () => {
        expect(getX(2, { parts: [], widthPerValue: 25 }))
            .toBe(60)
    })
})