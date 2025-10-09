import { DropdownItem } from './DropdownItem'
import { Icon } from '../static/Enums'

export class DropdownOptions {
    items: DropdownItem[]

    x: number

    y: number

    text?: string | undefined

    icon?: Icon | undefined

    data?: any
}