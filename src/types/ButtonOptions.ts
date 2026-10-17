import DropdownItem from 'types/DropdownItem'

class ButtonOptions {
    x: number

    y: number

    text: string

    action: () => void

    constructor(text: string, action: () => void) {
        this.text = text
        this.action = action
    }

    static fromItems(items: DropdownItem[] | undefined, data?: any): ButtonOptions[] {
        return (items ?? [])
            .filter(item => !item.isDivider && (item.condition?.(data) ?? true))
            .map(item => new ButtonOptions(item.text, () => item.action(data)))
    }
}

export default ButtonOptions