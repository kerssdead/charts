import Animations from '@/Animations'

describe('Getting calculated animations transition',()=>{
    it('Should be 0',()=>{
        expect(Animations.getTransition(0))
            .toBe(0)
    })

    it('Should be .1',()=>{
        expect(Animations.getTransition(.1))
            .toBeCloseTo(.03, 2)
    })

    it('Should be .2',()=>{
        expect(Animations.getTransition(.2))
            .toBeCloseTo(.08, 2)
    })

    it('Should be .3',()=>{
        expect(Animations.getTransition(.3))
            .toBeCloseTo(.15, 2)
    })

    it('Should be .4',()=>{
        expect(Animations.getTransition(.4))
            .toBeCloseTo(.26, 2)
    })

    it('Should be .5',()=>{
        expect(Animations.getTransition(.5))
            .toBeCloseTo(.5, 3)
    })

    it('Should be .6',()=>{
        expect(Animations.getTransition(.6))
            .toBeCloseTo(.74, 2)
    })

    it('Should be .7',()=>{
        expect(Animations.getTransition(.7))
            .toBeCloseTo(.85, 2)
    })

    it('Should be .8',()=>{
        expect(Animations.getTransition(.8))
            .toBeCloseTo(.92, 2)
    })

    it('Should be .9',()=>{
        expect(Animations.getTransition(.9))
            .toBeCloseTo(.97, 2)
    })

    it('Should be 1',()=>{
        expect(Animations.getTransition(1))
            .toBeCloseTo(1, 2)
    })

    it('Should clamp out of range values', () => {
        expect(Animations.getTransition(-1)).toBe(0)
        expect(Animations.getTransition(2)).toBe(1)
    })

    it('Should be continuous and monotonic', () => {
        let previous = 0

        for (let i = 1; i <= 10000; i++) {
            const value = Animations.getTransition(i / 10000)

            expect(value).toBeGreaterThanOrEqual(previous)
            expect(value - previous).toBeLessThan(.01)

            previous = value
        }
    })
})