import ItemData from '@/types/ItemData'

type DropdownItem = {
    isDivider?: boolean | undefined

    condition?: (arg?: ItemData) => boolean

    id?: string | undefined

    text: string

    action: (arg?: ItemData) => void
}

export default DropdownItem