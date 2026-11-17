import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'

describe('Animating hover of a shape without hover', () => {
    it('Should report no animation', () => {
        const arc = new RenderItemArc()
        const leader = new RenderItemLeaderLine(arc, new RenderItem(arc))

        expect(leader.animateHover(null, 0))
            .toBe(false)
    })
})
