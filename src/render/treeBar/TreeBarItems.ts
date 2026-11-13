import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { withAlpha } from '@/helpers/Color'
import { Layer } from '@/static/constants/Index'
import { MUTED_ALPHA, TRANSPARENT } from '@/render/treeBar/TreeBarConstants'

export function getMutedTextColor() {
    return withAlpha(Theme.text, MUTED_ALPHA)
}

export function addClickArea(
    items: QueueItemsBuilder,
    units: Units,
    area: RectangleDimensions,
    action: () => void
) {
    return items.rect()
                .box(units, area)
                .fill()
                .color(TRANSPARENT)
                .layer(Layer.Base)
                .onClick(action)
}