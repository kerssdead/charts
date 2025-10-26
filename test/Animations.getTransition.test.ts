import { Animations } from '../src/Animations'

describe('Getting calculated animations transition',()=>{
    it('Should be 0',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(0))
            .toBe(0)
    })

    it('Should be .1',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.1))
            .toBeCloseTo(.03, 2)
    })

    it('Should be .2',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.2))
            .toBeCloseTo(.08, 2)
    })

    it('Should be .3',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.3))
            .toBeCloseTo(.15, 2)
    })

    it('Should be .4',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.4))
            .toBeCloseTo(.26, 2)
    })

    it('Should be .5',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.5))
            .toBeCloseTo(.5, 3)
    })

    it('Should be .6',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.6))
            .toBeCloseTo(.74, 2)
    })

    it('Should be .7',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.7))
            .toBeCloseTo(.85, 2)
    })

    it('Should be .8',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.8))
            .toBeCloseTo(.92, 2)
    })

    it('Should be .9',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(.9))
            .toBeCloseTo(.97, 2)
    })

    it('Should be 1',()=>{
        Animations.initializeTransitions()

        expect(Animations.getTransition(1))
            .toBeCloseTo(1, 2)
    })
})