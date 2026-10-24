import Value from '@/types/base/Value'
import Sector from '@/types/Sector'

class TreeBarRow extends Value {
    subLabel: string | undefined

    image: string | undefined

    parts: Sector[]

    barLabel: string | undefined

    cells: Record<string, string | number> | undefined

    expanded: boolean | undefined

    children: TreeBarRow[] | undefined

    get hasChildren() {
        return (this.children?.length ?? 0) > 0
    }
}

export default TreeBarRow
