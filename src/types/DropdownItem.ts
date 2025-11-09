class DropdownItem {
    isDivider?: boolean | undefined

    condition?: (arg?: any) => boolean

    id?: string | undefined

    text: string

    action: (arg?: any) => void
}

export default DropdownItem