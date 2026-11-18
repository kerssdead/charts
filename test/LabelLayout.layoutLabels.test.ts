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

    it('Should keep labels inside the bounds while spreading them', () => {
        const top = Math.PI / 2
        const placements = layoutLabels([
            label(top, 3),
            label(top + .05, 2),
            label(top + .1, 1),
            label(top + .15, 1)
        ], DISTANCE, { x: 60, y: 46 })

        expect(placements)
            .toHaveLength(4)
        expect(placements.some(placement => !placement.isVisible))
            .toBe(true)
    })

    it('Should settle labels that keep pushing each other back and forth', () => {
        const placements = layoutLabels([
            { angle: 1.732618541872417, value: 3, halfWidth: 12, halfHeight: 6 },
            { angle: 1.9519072893131093, value: 4, halfWidth: 26, halfHeight: 6 },
            { angle: 1.818054666546199, value: 3, halfWidth: 30, halfHeight: 6 },
            { angle: 2.5407426751687856, value: 3, halfWidth: 29, halfHeight: 6 }
        ], DISTANCE, { x: 120, y: 90 })

        expect(placements)
            .toEqual([
                { angle: 1.209019766274118, isVisible: true },
                { angle: 2.475506064911408, isVisible: true },
                { angle: 1.818054666546199, isVisible: false },
                { angle: 2.7807426751687805, isVisible: true }
            ])
    })

    it('Should turn a label sideways when it sticks out of the horizontal bounds', () => {
        const [placement] = layoutLabels([label(0, 1)], DISTANCE, { x: 50, y: 50 })

        expect(placement.angle)
            .not.toBe(0)
    })
})