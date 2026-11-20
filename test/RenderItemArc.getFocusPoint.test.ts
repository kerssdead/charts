import { arc, WINDOW } from './RenderItemArcTestData'

describe('Getting arc focus point', () => {
    it('Should be in the middle of the sector', () => {
        const target = arc()

        target.startAngle = 0
        target.endAngle = Math.PI / 2
        target.adjust(WINDOW)

        const point = target.getFocusPoint()

        expect([point?.x, point?.y].map(value => Math.round(value ?? 0)))
            .toEqual([2677, 2677])
    })

    it('Should stay between the rings of a pulled donut sector', () => {
        const target = arc()

        target.startAngle = 0
        target.endAngle = 0
        target.innerRadius = 200
        target.pull = 100
        target.adjust(WINDOW)

        expect(target.getFocusPoint())
            .toEqual({ x: 2950, y: 2500 })
    })
})