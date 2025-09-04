class AnimationItem {
    timer?: Date | null

    before?: () => boolean

    body: (arg: number) => void

    duration: number

    continuous?: boolean = false
}