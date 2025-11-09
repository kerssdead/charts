class TooltipValue {
    text: string | undefined

    color: string | undefined

    constructor(text?: string, color?: string) {
        this.text = text
        this.color = color
    }
}

export default TooltipValue