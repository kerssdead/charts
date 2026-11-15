import { FULL_ANGLE } from '@/static/constants/Index'
import { arc } from './RenderItemArcTestData'

describe('Disappearing arc', () => {
    it('Should shrink to the given angle', () => {
        const target = arc()

        target.disappearToAngle(.7, 0)

        expect(target.from)
            .toEqual({
                x: 2500,
                y: 2500,
                radius: 500,
                innerRadius: 0,
                startAngle: 0,
                endAngle: FULL_ANGLE,
                pull: 0
            })
        expect(target.startAngle)
            .toBe(.7)
        expect(target.endAngle)
            .toBe(.7)
    })
})