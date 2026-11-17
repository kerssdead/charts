import Transition from '@/renderer/Transition'
import { createItem, createQueue } from './TransitionTestData'

describe('Taking transition snapshot', () => {
    it('Should keep keyed items by key', () => {
        const queue = createQueue()
        const item = createItem('a')

        queue.add([item])

        expect(Transition.snapshot(queue).get('a'))
            .toBe(item)
    })

    it('Should skip items without key', () => {
        const queue = createQueue()

        queue.add([createItem(null)])

        expect(Transition.snapshot(queue).size)
            .toBe(0)
    })

    it('Should skip leaving items and items removed after morph', () => {
        const queue = createQueue()
        const leaving = createItem('leaving')
        const morphing = createItem('morphing')

        leaving.animation.isLeaving = true
        morphing.animation.removeAfterMorph = true
        queue.add([leaving, morphing, createItem('stays')])

        expect([...Transition.snapshot(queue).keys()])
            .toEqual(['stays'])
    })
})
