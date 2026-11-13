import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import Theme from '@/Theme'
import { Layer } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'

export type ButtonRect = {
    rect: RectangleDimensions
    radius: number
    hover: number
    onClick: () => void
}

export type ButtonText = {
    rect: RectangleDimensions
    text: string
    size: number
}

export function addButtonRect(items: QueueItemsBuilder, units: Units, button: ButtonRect) {
    return items.rect()
                .box(units, button.rect)
                .round(units.x(button.radius))
                .fill()
                .color(Theme.hoverBackground(button.hover))
                .layer(Layer.Legend + 1)
                .fixed()
                .onClick(button.onClick)
}

export function addButtonText(items: QueueItemsBuilder, units: Units, { rect, text, size }: ButtonText) {
    items.text(text)
         .position(units.x(rect.x + rect.width / 2), units.y(rect.y + rect.height / 2))
         .size(size)
         .align(TextAlignment.Center)
         .color(Theme.text)
         .layer(Layer.Legend + 2)
         .fixed()
}