import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'

const leader = (offset: number, anchor: number) => {
    const arc = new RenderItemArc()

    return Object.assign(new RenderItemLeaderLine(arc, new RenderItem(arc)), { offset, anchor })
}

describe('Getting current leader angles', () => {
    it('Should return own angles when not morphing', () => {
        expect(leader(.4, .2).current(.5))
            .toEqual({ offset: .4, anchor: .2 })
    })

    it('Should interpolate from previous angles during a morph', () => {
        const next = leader(.4, .2)

        next.morphFrom(leader(0, 0), 1)

        expect(next.current(.5))
            .toEqual({ offset: .2, anchor: .1 })
    })

    it('Should return own angles at the end of a morph', () => {
        const next = leader(.4, .2)

        next.morphFrom(leader(0, 0), 1)

        expect(next.current(1))
            .toEqual({ offset: .4, anchor: .2 })
    })
})