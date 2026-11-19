import Transition from '@/renderer/Transition'
import RenderItem from '@/types/RenderItem'
import RenderItemArc from '@/types/RenderItemArc'
import Panel from '@/types/Panel'
import { ItemFlag as f } from '@/static/ItemFlag'
import {
    createAxis,
    createItem,
    createPanel,
    createQueue,
    DURATION,
    FakeShape
} from './TransitionTestData'

const shapeOf = (target: RenderItem) => target.shape as FakeShape

const applyTransition = (
    current: RenderItem[],
    previous: RenderItem[],
    previousPanels: Panel[] = [],
    panels: Panel[] = []
) => {
    const queue = createQueue(current)
    const snapshot = new Map(previous.map(target => [target.key as string, target]))

    new Transition(queue, previousPanels, panels, DURATION).apply(snapshot)

    return queue
}

const createArc = (key: string, startAngle: number, endAngle: number) => {
    const shape = new RenderItemArc()

    shape.startAngle = startAngle
    shape.endAngle = endAngle

    return createItem(key, shape)
}

describe('Applying a transition', () => {
    it('Should morph an item from the previous item with the same key', () => {
        const current = createItem('a')

        applyTransition([current], [createItem('a')])

        expect(shapeOf(current).calls)
            .toEqual(['morphFrom'])
        expect(current.animation.isMorphing)
            .toBe(true)
    })

    it('Should not morph when the shape cannot morph from the previous one', () => {
        const current = createItem('a', new FakeShape(false))

        applyTransition([current], [createItem('a')])

        expect(current.animation.isMorphing)
            .toBe(false)
    })

    it('Should leave a ghost that stays a ghost untouched', () => {
        const current = createItem('a')
        const previous = createItem('a')

        current.setGhost(true)
        previous.setGhost(true)

        applyTransition([current], [previous])

        expect(shapeOf(current).calls)
            .toEqual([])
    })

    it('Should ignore items without a key', () => {
        const current = createItem(null)

        applyTransition([current], [])

        expect(shapeOf(current).calls)
            .toEqual([])
    })

    it('Should appear a new item', () => {
        const current = createItem('a')

        applyTransition([current], [])

        expect(shapeOf(current).calls)
            .toEqual(['appear'])
        expect(current.animation.isMorphing)
            .toBe(true)
    })

    it('Should start the initial animation when the new shape cannot morph in', () => {
        const current = createItem('a', new FakeShape(false))

        applyTransition([current], [])

        expect(current.animation.isInitializing)
            .toBe(true)
    })

    it('Should not animate a new ghost', () => {
        const current = createItem('a')

        current.setGhost(true)

        applyTransition([current], [])

        expect(shapeOf(current).calls)
            .toEqual([])
    })

    it('Should enter a new item from the previous value axis', () => {
        const current = createItem('a')

        current.axisValue = 5
        current.panel = createPanel(0)

        applyTransition([current], [], [createPanel(0, createAxis(10))], [createPanel(0, createAxis(10))])

        expect(shapeOf(current).calls)
            .toEqual(['enterFromAxis:50'])
    })

    it('Should ignore a horizontal previous axis when entering', () => {
        const current = createItem('a')

        current.axisValue = 5
        current.panel = createPanel(0)

        applyTransition([current], [], [createPanel(0, createAxis(10, true))], [])

        expect(shapeOf(current).calls)
            .toEqual(['appear'])
    })

    it('Should map the appear position between the previous and the next axis', () => {
        const current = createItem('a')

        current.panel = createPanel(0)

        applyTransition([current], [], [createPanel(0, createAxis(10))], [createPanel(0, createAxis(2))])

        expect(shapeOf(current).appearMapY?.(4))
            .toBe(20)
    })

    it('Should appear without mapping when an axis is missing', () => {
        const current = createItem('a')

        current.panel = createPanel(0)

        applyTransition([current], [], [createPanel(0, createAxis(10))], [createPanel(0)])

        expect(shapeOf(current).appearMapY)
            .toBeUndefined()
    })

    it('Should keep a removed item in the queue and disappear it', () => {
        const previous = createItem('a')

        const queue = applyTransition([], [previous])

        expect(queue.items)
            .toContain(previous)
        expect(shapeOf(previous).calls)
            .toEqual(['disappear'])
        expect(previous.animation.removeAfterMorph)
            .toBe(true)
    })

    it('Should not keep a removed ghost', () => {
        const previous = createItem('a')

        previous.setGhost(true)

        const queue = applyTransition([], [previous])

        expect(queue.items)
            .toHaveLength(0)
        expect(shapeOf(previous).calls)
            .toEqual([])
    })

    it('Should leave a removed item to the next value axis', () => {
        const previous = createItem('a')

        previous.axisValue = 3
        previous.panel = createPanel(0)

        applyTransition([], [previous], [createPanel(0, createAxis(10))], [createPanel(0, createAxis(4))])

        expect(shapeOf(previous).calls)
            .toEqual(['leaveToAxis:12'])
    })

    it('Should fade a removed item when the next panel has no vertical axis', () => {
        const previous = createItem('a')

        previous.set(f.Fading, false)
        previous.panel = createPanel(0)

        applyTransition([], [previous], [createPanel(0, createAxis(10))], [createPanel(0)])

        expect(previous.is(f.Fading))
            .toBe(true)
    })

    it('Should keep a removed item unfaded when the next panel has a vertical axis', () => {
        const previous = createItem('a')

        previous.set(f.Fading, false)
        previous.panel = createPanel(0)

        applyTransition([], [previous], [createPanel(0, createAxis(10))], [createPanel(0, createAxis(10))])

        expect(previous.is(f.Fading))
            .toBe(false)
    })

    it('Should move a removed item to the panel with the same index', () => {
        const previous = createItem('a')
        const next = createPanel(0)

        previous.panel = createPanel(0)

        applyTransition([], [previous], [], [next])

        expect(previous.panel)
            .toBe(next)
    })

    it('Should keep the panel of a removed item without a panel at that index', () => {
        const previous = createItem('a')
        const old = createPanel(1)

        previous.panel = old

        applyTransition([], [previous], [], [createPanel(0)])

        expect(previous.panel)
            .toBe(old)
    })

    it('Should grow an appearing arc from its own start without neighbours', () => {
        const current = createArc('a', .2, 1)

        applyTransition([current], [])

        expect(current.animation.isMorphing)
            .toBe(true)
        expect((current.shape as RenderItemArc).startAngle)
            .toBe(.2)
    })

    it('Should collapse a removed arc and keep it until the morph ends', () => {
        const previous = createArc('a', 0, 1)

        const queue = applyTransition([], [previous])

        expect(queue.items)
            .toContain(previous)
        expect(previous.animation.removeAfterMorph)
            .toBe(true)
        expect(previous.animation.isMorphing)
            .toBe(true)
    })

    it('Should not collapse a removed ghost arc', () => {
        const previous = createArc('a', 0, 1)

        previous.setGhost(true)

        const queue = applyTransition([], [previous])

        expect(queue.items)
            .toHaveLength(0)
    })
})