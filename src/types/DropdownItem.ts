class DropdownItem {
    isDivider?: boolean | undefined

    id?: string | undefined

    text: string

    action: (arg?: any) => void
}