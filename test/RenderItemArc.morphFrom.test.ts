import RenderItemArc from '@/types/RenderItemArc'
import { arc } from './RenderItemArcTestData'

describe('Morphing arc', () => {
    it('Should not morph from a different shape', () => {
        expect(arc().morphFrom({} as never, 1))
            .toBe(false)
    })

    it('Should take the previous geometry', () => {
        const previous = new RenderItemArc()

        previous.absolute = { x: 100, y: 200 }
        previous.radius = 50
        previous.innerRadius = 10
        previous.startAngle = .5
        previous.endAngle = 2
        previous.pull = 4

        const target = new RenderItemArc()

        expect(target.morphFrom(previous, 1))
            .toBe(true)
        expect(target.from)
            .toEqual({ x: 100, y: 200, radius: 50, innerRadius: 10, startAngle: .5, endAngle: 2, pull: 4 })
    })
})