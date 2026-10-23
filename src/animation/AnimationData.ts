export default class AnimationData {
    alpha: number = 1

    scale: number = 1

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
}