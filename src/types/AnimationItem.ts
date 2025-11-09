class AnimationItem {
    timer?: Date | undefined

    before?: () => boolean

    body: (arg: number) => void

    duration: number

    continuous?: boolean = false

    backward?: boolean = false
}

export default AnimationItem