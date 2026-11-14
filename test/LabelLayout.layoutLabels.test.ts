import layoutLabels, { LabelBox } from '@/render/LabelLayout'

const DISTANCE = 40

const BOUNDS = { x: 100, y: 50 }

const MAX_VISIBLE_COUNT = 31

const label = (angle: number, value: number): LabelBox => ({ angle, value, halfWidth: 20, halfHeight: 5 })

const crowdWithLoneSmallLabel = (crowdCount: number) => {
    return [...Array.from({ length: crowdCount }, () => label(0, 10)), label(Math.PI, 1)]
}

describe('Laying out labels', () => {
    it('Should show lone small label when labels fit max visible count', () => {
        const placements = layoutLabels(crowdWithLoneSmallLabel(MAX_VISIBLE_COUNT - 1), DISTANCE, BOUNDS)

        expect(placements.at(-1)?.isVisible)
            .toBe(true)
    })

    it('Should hide smallest labels beyond max visible count', () => {
        const placements = layoutLabels(crowdWithLoneSmallLabel(MAX_VISIBLE_COUNT), DISTANCE, BOUNDS)

        expect(placements.at(-1))
            .toEqual({ angle: Math.PI, isVisible: false })
    })

    it('Should return placement for every label', () => {
        const labels = crowdWithLoneSmallLabel(MAX_VISIBLE_COUNT * 2)

        expect(layoutLabels(labels, DISTANCE, BOUNDS))
            .toHaveLength(labels.length)
    })

    it('Should fit labels that start outside the bounds', () => {
        const placements = layoutLabels([
            { angle: Math.PI / 2, value: 1, halfWidth: 20, halfHeight: 5 },
            { angle: 0, value: 2, halfWidth: 20, halfHeight: 5 }
        ], DISTANCE, { x: 100, y: 49 })

        expect(placements.length)
            .toBe(2)
    })

    it('Should spread overlapping labels apart', () => {
        const placements = layoutLabels([
            { angle: 0, value: 3, halfWidth: 20, halfHeight: 5 },
            { angle: 0, value: 2, halfWidth: 20, halfHeight: 5 },
            { angle: 0, value: 1, halfWidth: 20, halfHeight: 5 }
        ], DISTANCE, BOUNDS)

        expect(placements)
            .toHaveLength(3)
    })
})