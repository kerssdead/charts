import Sector from '@/types/Sector'
import { parseNumber } from '@/helpers/Numbers'

class SegmentedBarStop extends Sector {
    isPercent: boolean

    constructor(obj: object = {}) {
        super(obj)

        const text = String(this.value).trim()

        this.isPercent = text.endsWith('%')

        if (this.isPercent)
            this.value = parseNumber(text.slice(0, -1))
    }
}

export default SegmentedBarStop
