import ArcNeighbours from '@/renderer/ArcNeighbours'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import Panel from '@/types/Panel'

const arc = (startAngle: number, endAngle: number) => {
    const shape = new RenderItemArc()

    shape.startAngle = startAngle
    shape.endAngle = endAngle

    return new RenderItem(shape)
}

const neighbours = (newArcs: RenderItem[], matches: [RenderItem, RenderItem][]) => {
    return new ArcNeighbours(newArcs, matches.map(([, old]) => old), new Map(matches))
}

describe('Getting the angle a new arc appears from', () => {
    it('Should appear from the previous end of the matched arc before it', () => {
        const oldA = arc(0, 1)
        const newA = arc(0, .5)
        const newB = arc(.5, 1)

        expect(neighbours([newA, newB], [[newA, oldA]]).appearAngle(newB))
            .toBe(1)
    })

    it('Should look through other appearing arcs for a matched one', () => {
        const oldA = arc(0, 1)
        const newA = arc(0, .5)
        const newB = arc(.5, .7)
        const newC = arc(.7, 1)

        expect(neighbours([newA, newB, newC], [[newA, oldA]]).appearAngle(newC))
            .toBe(1)
    })

    it('Should appear from its own start without a matched arc before it', () => {
        const newA = arc(.2, 1)

        expect(neighbours([newA], []).appearAngle(newA))
            .toBe(.2)
    })

    it('Should use the current end of a morphing arc', () => {
        const oldA = arc(0, 1)
        const newA = arc(0, .4)
        const newB = arc(.4, 1)

        oldA.animation.morph = .5;
        (oldA.shape as RenderItemArc).appearFromAngle(0)

        expect(neighbours([newA, newB], [[newA, oldA]]).appearAngle(newB))
            .toBe(.5)
    })

    it('Should ignore arcs of another panel', () => {
        const oldA = arc(0, 1)
        const newA = arc(0, .5)
        const newB = arc(.5, 1)

        newB.panel = { index: 1 } as Panel

        expect(neighbours([newA, newB], [[newA, oldA]]).appearAngle(newB))
            .toBe(.5)
    })

    it('Should stop on arcs that end where they start', () => {
        const newA = arc(.5, .5)

        expect(neighbours([newA], []).appearAngle(newA))
            .toBe(.5)
    })
})