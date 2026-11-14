import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemLeaderLine from '@/types/RenderItemLeaderLine'

const leader = (offset: number, anchor: number) => {
    const arc = new RenderItemArc()

    return Object.assign(new RenderItemLeaderLine(arc, new RenderItem(arc)), { offset, anchor })
}

describe('Morphing leader line', () => {
    it('Should not morph from another shape', () => {
        const next = leader(.4, .2)

        expect(next.morphFrom(new RenderItemArc(), 1))
            .toBe(false)
        expect(next.current(0))
            .toEqual({ offset: .4, anchor: .2 })
    })

    it('Should start from the angles of the previous leader', () => {
        const next = leader(.4, .2)

        expect(next.morphFrom(leader(.1, .05), 1))
            .toBe(true)
        expect(next.current(0))
            .toEqual({ offset: .1, anchor: .05 })
    })

    it('Should start from where a morphing previous leader is', () => {
        const previous = leader(.2, .2)
        const next = leader(.4, .2)

        previous.morphFrom(leader(0, 0), 1)
        next.morphFrom(previous, .5)

        expect(next.current(0))
            .toEqual({ offset: .1, anchor: .1 })
    })
})