import Value from '@/types/base/Value'
import Sector from '@/types/Sector'

class TreeBarRow extends Value {
    subLabel?: string

    image?: string

    label!: string

    parts!: Sector[]

    barLabel?: string

    cells?: Record<string, string | number>

    expanded?: boolean

    children?: TreeBarRow[]

    get hasChildren() {
        return (this.children?.length ?? 0) > 0
    }
}

export default TreeBarRow