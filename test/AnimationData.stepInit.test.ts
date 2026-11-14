import AnimationData from '@/animation/AnimationData'

const create = () => new AnimationData()

describe('Creating animation data', () => {
    it('Should start fully visible and static', () => {
        const animation = create()

        expect(animation.init)
            .toBe(1)
        expect(animation.visibility)
            .toBe(1)
        expect(animation.isInitializing)
            .toBe(false)
        expect(animation.isMorphing)
            .toBe(false)
        expect(animation.initFade)
            .toBe(false)
        expect(animation.morphFade)
            .toBeNull()
        expect(animation.initStart)
            .toBeNull()
        expect(animation.morphStart)
            .toBeNull()
    })
})

describe('Starting initialization', () => {
    it('Should reset appearance for entering items', () => {
        const animation = create()

        animation.startInit(100, false)

        expect(animation.init)
            .toBe(0)
        expect(animation.initDuration)
            .toBe(100)
        expect(animation.initDelay)
            .toBe(animation.appearDelay)
        expect(animation.initFade)
            .toBe(true)
        expect(animation.initStart)
            .toBeNull()
        expect(animation.isLeaving)
            .toBe(false)
    })

    it('Should keep appearance for leaving items without delay', () => {
        const animation = create()

        animation.appearDelay = 50
        animation.startInit(100, true)

        expect(animation.init)
            .toBe(1)
        expect(animation.isLeaving)
            .toBe(true)
        expect(animation.initDelay)
            .toBe(0)
    })
})

describe('Stepping initialization', () => {
    it('Should do nothing when not initializing', () => {
        expect(create().stepInit(1000))
            .toBe(false)
    })

    it('Should grow appearance on progress', () => {
        const animation = create()

        animation.startInit(100, false)
        animation.stepInit(1000)

        expect(animation.stepInit(1050))
            .toBe(false)
        expect(animation.initStart)
            .toBe(1000)
        expect(animation.init)
            .toBeGreaterThan(0)
        expect(animation.init)
            .toBeLessThan(1)
    })

    it('Should remember the start timestamp only once', () => {
        const animation = create()

        animation.startInit(100, false)
        animation.stepInit(10)
        animation.stepInit(20)

        expect(animation.initStart)
            .toBe(10)
    })

    it('Should finish initialization for entering items', () => {
        const animation = create()

        animation.startInit(100, false)
        animation.stepInit(0)

        expect(animation.stepInit(1000))
            .toBe(false)
        expect(animation.init)
            .toBe(1)
        expect(animation.initDuration)
            .toBe(0)
        expect(animation.initFade)
            .toBe(false)
        expect(animation.isInitializing)
            .toBe(false)
    })

    it('Should finish leaving initialization and request removal', () => {
        const animation = create()

        animation.startInit(100, true)
        animation.stepInit(0)

        expect(animation.stepInit(1000))
            .toBe(true)
        expect(animation.init)
            .toBe(0)
        expect(animation.initFade)
            .toBe(true)
        expect(animation.isLeaving)
            .toBe(true)
    })
})

describe('Starting morph', () => {
    it('Should fade in from invisible', () => {
        const animation = create()

        animation.startMorph('in', 200, 50)

        expect(animation.morphFade)
            .toBe('in')
        expect(animation.morph)
            .toBe(0)
        expect(animation.morphDuration)
            .toBe(200)
        expect(animation.morphDelay)
            .toBe(50)
        expect(animation.morphStart)
            .toBeNull()
        expect(animation.visibility)
            .toBe(0)
    })

    it('Should keep current visibility for other fades', () => {
        const animation = create()

        animation.visibility = .5
        animation.startMorph('out', 200)

        expect(animation.visibility)
            .toBe(.5)
    })
})

describe('Stepping morph', () => {
    it('Should do nothing when not morphing', () => {
        expect(create().stepMorph(1000))
            .toBe(false)
    })

    it('Should grow morph on progress', () => {
        const animation = create()

        animation.startMorph('in', 200)
        animation.stepMorph(1000)

        expect(animation.stepMorph(1050))
            .toBe(false)
        expect(animation.morphStart)
            .toBe(1000)
        expect(animation.morph)
            .toBeGreaterThan(0)
        expect(animation.morph)
            .toBeLessThan(1)
    })

    it('Should finish morph and clear the fade', () => {
        const animation = create()

        animation.startMorph('out', 200)
        animation.stepMorph(0)

        expect(animation.stepMorph(1000))
            .toBe(false)
        expect(animation.morph)
            .toBe(1)
        expect(animation.morphDuration)
            .toBe(0)
        expect(animation.morphFade)
            .toBeNull()
        expect(animation.isMorphing)
            .toBe(false)
    })

    it('Should keep fade when item is removed after morph', () => {
        const animation = create()

        animation.startMorph('out', 200)
        animation.removeAfterMorph = true
        animation.stepMorph(0)

        expect(animation.stepMorph(1000))
            .toBe(true)
        expect(animation.morphFade)
            .toBe('out')
    })
})

describe('Updating visibility', () => {
    it('Should stay visible when not fading', () => {
        const animation = create()

        animation.init = 0
        animation.morph = .25
        animation.updateVisibility(false)

        expect(animation.visibility)
            .toBe(1)
    })

    it('Should follow initialization fade', () => {
        const animation = create()

        animation.initFade = true
        animation.init = .4
        animation.updateVisibility(true)

        expect(animation.visibility)
            .toBe(.4)
    })

    it('Should follow morph in fade', () => {
        const animation = create()

        animation.morphFade = 'in'
        animation.morph = .6
        animation.updateVisibility(true)

        expect(animation.visibility)
            .toBe(.6)
    })

    it('Should follow morph out fade', () => {
        const animation = create()

        animation.morphFade = 'out'
        animation.morph = .4
        animation.updateVisibility(true)

        expect(animation.visibility)
            .toBe(.6)
    })

    it('Should stay visible when no fade is active', () => {
        const animation = create()

        animation.init = .2
        animation.morph = .3
        animation.updateVisibility(true)

        expect(animation.visibility)
            .toBe(1)
    })
})

