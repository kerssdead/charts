import ease from '@/animation/Animations'
import { clamp } from '@/helpers/Geometry'

function getProgress(now: DOMHighResTimeStamp, start: DOMHighResTimeStamp, delay: number, duration: number) {
    return clamp((now - start - delay) / duration, 0, 1)
}

export default class AnimationData {
    alpha: number = 1

    mono: number = 0

    init: number = 1

    initDuration: number = 0

    initDelay: number = 0

    initStart: DOMHighResTimeStamp | null = null

    isLeaving: boolean = false

    morph: number = 1

    morphDuration: number = 0

    morphStart: DOMHighResTimeStamp | null = null

    morphDelay: number = 0

    appearDelay: number = 0

    morphFade: 'in' | 'out' | null = null

    removeAfterMorph: boolean = false

    initFade: boolean = false

    visibility: number = 1

    get isInitializing() {
        return this.initDuration > 0
    }

    get isMorphing() {
        return this.morphDuration > 0
    }

    startInit(duration: number, isLeaving: boolean) {
        if (!isLeaving)
            this.init = 0

        this.isLeaving = isLeaving
        this.initFade = true
        this.initDuration = duration
        this.initDelay = isLeaving ? 0 : this.appearDelay
        this.initStart = null
    }

    startMorph(fade: 'in' | 'out' | null, duration: number, delay: number = 0) {
        this.morphFade = fade
        this.morph = 0
        this.morphDuration = duration
        this.morphDelay = delay
        this.morphStart = null

        if (fade === 'in')
            this.visibility = 0
    }

    stepInit(now: DOMHighResTimeStamp): boolean {
        if (!this.isInitializing)
            return false

        this.initStart ??= now

        const progress = getProgress(now, this.initStart, this.initDelay, this.initDuration)
        const transition = ease(progress)

        this.init = this.isLeaving ? 1 - transition : transition

        if (progress < 1)
            return false

        this.init = this.isLeaving ? 0 : 1
        this.initDuration = 0
        this.initFade = this.isLeaving

        return this.isLeaving
    }

    stepMorph(now: DOMHighResTimeStamp): boolean {
        if (!this.isMorphing)
            return false

        this.morphStart ??= now

        const progress = getProgress(now, this.morphStart, this.morphDelay, this.morphDuration)

        this.morph = ease(progress)

        if (progress < 1)
            return false

        this.morph = 1
        this.morphDuration = 0

        if (!this.removeAfterMorph)
            this.morphFade = null

        return this.removeAfterMorph
    }

    updateVisibility(isFading: boolean) {
        if (!isFading)
            this.visibility = 1
        else if (this.initFade)
            this.visibility = this.init
        else if (this.morphFade === 'in')
            this.visibility = this.morph
        else if (this.morphFade === 'out')
            this.visibility = 1 - this.morph
        else
            this.visibility = 1
    }
}