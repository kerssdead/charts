import DropdownItem from '@/types/DropdownItem'
import ItemData from '@/types/ItemData'

type ButtonOptions = {
    text: string

    action: () => void

    isDivider?: boolean
}

export const DIVIDER: ButtonOptions = { text: '', action: () => { }, isDivider: true }

function isShown(item: DropdownItem, data?: ItemData) {
    return item.condition?.(data) ?? true
}

function endsWithDivider(buttons: ButtonOptions[]) {
    return !!buttons[buttons.length - 1]?.isDivider
}

export function fromDropdownItems(items: DropdownItem[] | undefined, data?: ItemData): ButtonOptions[] {
    const buttons: ButtonOptions[] = []

    for (const item of items ?? []) {
        if (!item.isDivider && isShown(item, data))
            buttons.push({ text: item.text, action: () => item.action(data) })
        else if (item.isDivider && buttons.length > 0 && !endsWithDivider(buttons))
            buttons.push(DIVIDER)
    }

    if (endsWithDivider(buttons))
        buttons.pop()

    return buttons
}

export default ButtonOptions