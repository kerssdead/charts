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

const neighbours = (newArcs: RenderItem[], matches: [RenderItem, RenderItem][], removed: RenderItem[]) => {
    return new ArcNeighbours(newArcs, [...matches.map(([, old]) => old), ...removed], new Map(matches))
}

describe('Getting the angle a removed arc disappears to', () => {
    it('Should disappear to the next end of the matched arc before it', () => {
        const oldA = arc(0, .5)
        const oldB = arc(.5, 1)
        const newA = arc(0, 1)

        expect(neighbours([newA], [[newA, oldA]], [oldB]).disappearAngle(oldB))
            .toBe(1)
    })

    it('Should look through other removed arcs for a matched one', () => {
        const oldA = arc(0, .3)
        const oldB = arc(.3, .6)
        const oldC = arc(.6, 1)
        const newA = arc(0, .8)

        expect(neighbours([newA], [[newA, oldA]], [oldB, oldC]).disappearAngle(oldC))
            .toBe(.8)
    })

    it('Should disappear to its own start without a matched arc before it', () => {
        const oldA = arc(.2, 1)

        expect(neighbours([], [], [oldA]).disappearAngle(oldA))
            .toBe(.2)
    })

    it('Should use the current start of a morphing arc', () => {
        const oldA = arc(0, .5)
        const oldB = arc(.5, 1)
        const newA = arc(0, .9)

        oldB.animation.morph = .5;
        (oldB.shape as RenderItemArc).appearFromAngle(.3)

        expect(neighbours([newA], [[newA, oldA]], [oldB]).disappearAngle(oldB))
            .toBeCloseTo(.4)
    })

    it('Should ignore arcs of another panel', () => {
        const oldA = arc(0, .5)
        const oldB = arc(.5, 1)
        const newA = arc(0, 1)

        oldB.panel = { index: 1 } as Panel

        expect(neighbours([newA], [[newA, oldA]], [oldB]).disappearAngle(oldB))
            .toBe(.5)
    })
})