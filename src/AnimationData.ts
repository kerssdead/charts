export default class AnimationData {
    alpha: number = 1

    scale: number = 1

    init: number = 1

    initDuration: number = 0

    initDelay: number = 0

    initStart: DOMHighResTimeStamp | null = null

    get isInitializing() {
        return this.initDuration > 0
    }

    static get default() {
        return new AnimationData()
    }
}