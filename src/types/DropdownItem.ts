class DropdownItem {
    isDivider?: boolean | undefined

    condition?: (arg?: any) => boolean

    id?: string | undefined

    text: string

    action: (arg?: any) => void

    static divider() {
        return {
            isDivider: true
        } as DropdownItem
    }

    static button(text: string, action: (arg?: any) => void) {
        return {
            text: text,
            action: action
        } as DropdownItem
    }
}

export default DropdownItem