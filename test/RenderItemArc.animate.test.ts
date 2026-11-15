import RenderItem from '@/types/RenderItem'
import { arc } from './RenderItemArcTestData'

describe('Animating arc hover', () => {
    it('Should lift the hovered arc without a group', () => {
        const target = arc()
        const item = new RenderItem(target)

        item.isInstant = true
        target.animate(item, false, 0)

        expect(target.hover)
            .toBe(1)

        target.animate(new RenderItem(target), true, 0)

        expect(target.hover)
            .toBe(0)
    })

    it('Should dim the arc of a hovered group', () => {
        const target = arc()
        const item = new RenderItem(target)

        item.isInstant = true
        item.hoverGroup = 'group'
        target.animate(item, false, 0)

        expect(item.animation.alpha)
            .toBe(.5)
    })
})