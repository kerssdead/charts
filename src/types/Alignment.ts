import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

export type Alignment = {
    x: HorizontalAlignment

    y: VerticalAlignment
}

export const DEFAULT_ALIGNMENT: Alignment = {
    x: HorizontalAlignment.Center,
    y: VerticalAlignment.Center
}