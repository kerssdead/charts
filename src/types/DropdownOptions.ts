import DropdownItem from 'types/DropdownItem'
import { Icon } from 'static/Enums'

class DropdownOptions {
    items: DropdownItem[]

    x: number

    y: number

    text?: string | undefined

    icon?: Icon | undefined

    data?: any
}

export default DropdownOptions