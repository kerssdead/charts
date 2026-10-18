import DropdownItem from '@/types/DropdownItem'

type ButtonOptions = {
    text: string

    action: () => void

    isDivider?: boolean
}

export const DIVIDER: ButtonOptions = { text: '', action: () => { }, isDivider: true }

export function fromDropdownItems(items: DropdownItem[] | undefined, data?: any): ButtonOptions[] {
    const buttons: ButtonOptions[] = []

    for (const item of items ?? []) {
        if (!item.isDivider && (item.condition?.(data) ?? true))
            buttons.push({ text: item.text, action: () => item.action(data) })
        else if (item.isDivider && buttons.length > 0 && !buttons[buttons.length - 1].isDivider)
            buttons.push(DIVIDER)
    }

    if (buttons[buttons.length - 1]?.isDivider)
        buttons.pop()

    return buttons
}

export default ButtonOptions