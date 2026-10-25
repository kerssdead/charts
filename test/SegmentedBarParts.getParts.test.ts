import { getParts } from '@/render/segmentedBar/SegmentedBarParts'
import Sector from '@/types/Sector'

const BAR = { x: 10, y: 20, width: 100, height: 30 }

const part = (value: number) => new Sector({ value })

const getBoxes = (values: number[], fullBarValue: number, minPartWidth = 0) =>
    getParts(values.map(part), BAR, fullBarValue, minPartWidth).parts.map(({ box }) => box)

describe('Getting segmented bar parts', () => {
    it('Should split bar proportionally to values', () => {
        expect(getBoxes([1, 3], 4))
            .toEqual([
                { x: 10, y: 20, width: 25, height: 30 },
                { x: 35, y: 20, width: 75, height: 30 }
            ])
    })

    it('Should keep sectors in parts', () => {
        const values = [part(1), part(3)]

        expect(getParts(values, BAR, 4, 0).parts.map(({ sector }) => sector))
            .toEqual(values)
    })

    it('Should scale parts to full bar value', () => {
        const { parts, widthPerValue } = getParts([part(20), part(30)], BAR, 100, 0)

        expect(parts.map(({ box }) => box.width))
            .toEqual([20, 30])
        expect(widthPerValue)
            .toBe(1)
    })

    it('Should widen small parts to min width and shrink others', () => {
        const { parts, widthPerValue } = getParts([part(1), part(99)], BAR, 100, 10)

        expect(parts.map(({ box }) => [box.x, box.width]))
            .toEqual([[10, 10], [20, 90]])
        expect(widthPerValue)
            .toBeCloseTo(90 / 99)
    })

    it('Should skip min width when small parts do not fit into bar', () => {
        const { parts, widthPerValue } = getParts(Array.from({ length: 10 }, () => part(1)), BAR, 10, 20)

        expect(parts.map(({ box }) => box.width))
            .toEqual(Array(10).fill(10))
        expect(widthPerValue)
            .toBe(10)
    })

    it('Should return no parts without values', () => {
        expect(getParts([], BAR, 1, 10).parts)
            .toEqual([])
    })
})