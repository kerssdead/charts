import Transition from '@/renderer/Transition'
import { createItem, createQueue } from './TransitionTestData'

describe('Taking a transition snapshot', () => {
    it('Should map keyed items by their key', () => {
        const first = createItem('first')
        const second = createItem('second')

        const snapshot = Transition.snapshot(createQueue([first, second]))

        expect(snapshot.get('first'))
            .toBe(first)
        expect(snapshot.get('second'))
            .toBe(second)
        expect(snapshot.size)
            .toBe(2)
    })

    it('Should skip items without a key', () => {
        expect(Transition.snapshot(createQueue([createItem(null)])).size)
            .toBe(0)
    })

    it('Should skip leaving items', () => {
        const leaving = createItem('leaving')

        leaving.animation.isLeaving = true

        expect(Transition.snapshot(createQueue([leaving])).size)
            .toBe(0)
    })

    it('Should skip items that are removed after morphing', () => {
        const removing = createItem('removing')

        removing.animation.removeAfterMorph = true

        expect(Transition.snapshot(createQueue([removing])).size)
            .toBe(0)
    })

    it('Should be empty for an empty queue', () => {
        expect(Transition.snapshot(createQueue()).size)
            .toBe(0)
    })
})