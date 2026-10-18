import DropdownItem from '@/types/DropdownItem'

class ButtonOptions {
    text: string

    action: () => void

    isDivider: boolean = false

    constructor(text: string, action: () => void) {
        this.text = text
        this.action = action
    }

    static divider() {
        const divider = new ButtonOptions('', () => { })

        divider.isDivider = true

        return divider
    }

    static fromItems(items: DropdownItem[] | undefined, data?: any): ButtonOptions[] {
        const buttons: ButtonOptions[] = []

        for (const item of items ?? []) {
            if (!item.isDivider && (item.condition?.(data) ?? true))
                buttons.push(new ButtonOptions(item.text, () => item.action(data)))
            else if (item.isDivider && buttons.length > 0 && !buttons[buttons.length - 1].isDivider)
                buttons.push(ButtonOptions.divider())
        }

        if (buttons[buttons.length - 1]?.isDivider)
            buttons.pop()

        return buttons
    }
}

export default ButtonOptions