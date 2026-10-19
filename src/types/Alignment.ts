import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

type Alignment = {
    x: HorizontalAlignment

    y: VerticalAlignment
}

export const DEFAULT_ALIGNMENT: Alignment = {
    x: HorizontalAlignment.Center,
    y: VerticalAlignment.Center
}

export default Alignment