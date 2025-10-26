import { Animations } from '../src/Animations'

describe('Calculating animation transitions', ()=>{
    it('Should has all values for 0 -> 1 with resolution of thousands',()=>{
        Animations.initializeTransitions()

        expect(Animations.transitionCurve.size)
            .toBe(10001)
    })
})