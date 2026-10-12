class ButtonOptions {
    x: number

    y: number

    text: string

    action: () => void

    constructor(text: string, action: () => void) {
        this.text = text
        this.action = action
    }
}

export default ButtonOptions