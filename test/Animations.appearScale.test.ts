import { appearScale } from '@/animation/Animations'

describe('Calculating appear scale', () => {
    it('Should grow from 105% to 100%', () => {
        expect([appearScale(0), appearScale(.5), appearScale(1)])
            .toEqual([1.05, 1.025, 1])
    })
})
