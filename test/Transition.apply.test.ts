import Transition from '@/renderer/Transition'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItem from '@/types/RenderItem'
import { ItemFlag as f } from '@/static/ItemFlag'
import { MorphFade } from '@/static/Enums'
import { axis, createItem, createQueue, DURATION, panel, panelsWithAxis } from './TransitionTestData'

const run = (
    previous: RenderItem[],
    next: RenderItem[],
    panels = { previous: [] as ReturnType<typeof panelsWithAxis>, next: [] as ReturnType<typeof panelsWithAxis> }
) => {
    const queue = createQueue()

    queue.add(previous)

    const snapshot = Transition.snapshot(queue)

    queue.clear()
    queue.add(next)
    new Transition(queue, panels.previous, panels.next, DURATION).apply(snapshot)

    return queue
}

describe('Applying transition', () => {
    it('Should morph item from the previous item with same key', () => {
        const old = createItem('a')
        const item = createItem('a')
        const morphFrom = jest.spyOn(item, 'morphFrom')

        run([old], [item])

        expect(morphFrom)
            .toHaveBeenCalledWith(old, DURATION)
    })

    it('Should not animate items without key', () => {
        const item = createItem(null)
        const appear = jest.spyOn(item, 'appear')

        run([], [item])

        expect(appear)
            .not.toHaveBeenCalled()
    })

    it('Should not morph ghost into ghost', () => {
        const old = createItem('a')
        const item = createItem('a')
        const morphFrom = jest.spyOn(item, 'morphFrom')

        old.set(f.Ghost, true)
        item.set(f.Ghost, true)
        run([old], [item])

        expect(morphFrom)
            .not.toHaveBeenCalled()
    })

    it('Should appear new item', () => {
        const item = createItem('a')
        const appear = jest.spyOn(item, 'appear')

        run([], [item])

        expect(appear)
            .toHaveBeenCalledWith(DURATION, undefined)
    })

    it('Should not appear new ghost', () => {
        const item = createItem('a')
        const appear = jest.spyOn(item, 'appear')

        item.set(f.Ghost, true)
        run([], [item])

        expect(appear)
            .not.toHaveBeenCalled()
    })

    it('Should enter new item from the previous value axis', () => {
        const previous = axis()
        const item = createItem('a', undefined, panel(0))
        const enterFromAxis = jest.spyOn(item, 'enterFromAxis')

        item.axisValue = 5
        run([], [item], { previous: panelsWithAxis(previous), next: panelsWithAxis(axis()) })

        expect(enterFromAxis)
            .toHaveBeenCalledWith(50, DURATION)
    })

    it('Should ignore horizontal value axis', () => {
        const item = createItem('a', undefined, panel(0))
        const appear = jest.spyOn(item, 'appear')

        item.axisValue = 5
        run([], [item], { previous: panelsWithAxis(axis(true)), next: panelsWithAxis(axis(true)) })

        expect(appear)
            .toHaveBeenCalledWith(DURATION, undefined)
    })

    it('Should appear from the position mapped between value axes', () => {
        const item = createItem('a', undefined, panel(0))
        const appear = jest.spyOn(item, 'appear')

        run([], [item], { previous: panelsWithAxis(axis(false, 10)), next: panelsWithAxis(axis(false, 5)) })

        const mapY = appear.mock.calls[0][1] as (y: number) => number

        expect(mapY(100))
            .toBe(200)
    })

    it('Should disappear removed item and keep it in the queue', () => {
        const old = createItem('a')
        const disappear = jest.spyOn(old, 'disappear')

        const queue = run([old], [])

        expect(disappear)
            .toHaveBeenCalledWith(DURATION, undefined)
        expect(queue.items)
            .toContain(old)
        expect(old.is(f.Fading))
            .toBe(true)
    })

    it('Should move removed item to the new panel with same index', () => {
        const previous = panel(0)
        const old = createItem('a', undefined, previous)
        const next = panel(0)

        run([old], [], { previous: [previous], next: [next] })

        expect(old.panel)
            .toBe(next)
    })

    it('Should keep the old panel when the new one is missing', () => {
        const previous = panel(1)
        const old = createItem('a', undefined, previous)

        run([old], [], { previous: [panel(0), previous], next: [panel(0)] })

        expect(old.panel)
            .toBe(previous)
    })

    it('Should leave removed item to the new value axis', () => {
        const old = createItem('a', undefined, panel(0))
        const leaveToAxis = jest.spyOn(old, 'leaveToAxis')

        old.axisValue = 3
        old.set(f.Fading, false)
        run([old], [], { previous: panelsWithAxis(axis()), next: panelsWithAxis(axis()) })

        expect(leaveToAxis)
            .toHaveBeenCalledWith(30, DURATION)
        expect(old.is(f.Fading))
            .toBe(false)
    })

    it('Should keep fading of removed item that was fading', () => {
        const old = createItem('a', undefined, panel(0))

        old.set(f.Fading, true)
        run([old], [], { previous: panelsWithAxis(axis()), next: panelsWithAxis(axis()) })

        expect(old.is(f.Fading))
            .toBe(true)
    })

    it('Should not keep removed ghost', () => {
        const old = createItem('a')

        old.set(f.Ghost, true)

        expect(run([old], []).items)
            .not.toContain(old)
    })

    it('Should appear new arc from its neighbour angle', () => {
        const item = createItem('a', new RenderItemArc())
        const arc = item.shape as RenderItemArc
        const appear = jest.spyOn(item, 'appear')

        arc.startAngle = 1
        arc.endAngle = 2
        run([], [item])

        expect(appear)
            .not.toHaveBeenCalled()
        expect([arc.startAngle, arc.endAngle])
            .toEqual([1, 2])
        expect(item.animation.morphFade)
            .toBe(MorphFade.In)
    })

    it('Should collapse removed arc to the neighbour angle and keep it in the queue', () => {
        const old = createItem('a', new RenderItemArc())
        const arc = old.shape as RenderItemArc

        arc.startAngle = 1
        arc.endAngle = 2

        const queue = run([old], [])

        expect(queue.items)
            .toContain(old)
        expect(arc.endAngle)
            .toBe(arc.startAngle)
        expect(old.animation.morphFade)
            .toBe(MorphFade.Out)
    })

    it('Should not collapse removed ghost arc', () => {
        const old = createItem('a', new RenderItemArc())

        old.set(f.Ghost, true)

        expect(run([old], []).items)
            .not.toContain(old)
    })
})
