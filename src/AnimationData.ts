export default class AnimationData {
    alpha: number = 1

    scale: number = 1

    init: number = 1

    initDuration: number = 0

    initDelay: number = 0

    initStart: DOMHighResTimeStamp | null = null

    isLeaving: boolean = false

    morph: number = 1

    morphDuration: number = 0

    morphStart: DOMHighResTimeStamp | null = null

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

    static get default() {
        return new AnimationData()
    }
}