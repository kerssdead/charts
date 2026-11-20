import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RectangleDimensions from '@/types/RectangleDimensions'
import Units from '@/helpers/Units'
import { hoverBackground, ThemePalette } from '@/Theme'
import { Layer } from '@/static/constants/Index'
import { FocusOrder, TextAlignment } from '@/static/Enums'

export type ButtonRect = {
    rect: RectangleDimensions
    radius: number
    hover: number
    focusOrder: FocusOrder
    onClick: () => void
}

export type ButtonText = {
    rect: RectangleDimensions
    text: string
    size: number
}

export function addButtonRect(
    items: QueueItemsBuilder,
    units: Units,
    button: ButtonRect,
    theme: ThemePalette
) {
    return items.rect()
                .box(units, button.rect)
                .round(units.x(button.radius))
                .fill()
                .color(hoverBackground(theme, button.hover))
                .layer(Layer.Legend + 1)
                .fixed()
                .focusable(button.focusOrder)
                .onClick(button.onClick)
}

export function addButtonText(
    items: QueueItemsBuilder,
    units: Units,
    { rect, text, size }: ButtonText,
    theme: ThemePalette
) {
    items.text(text)
         .position(units.x(rect.x + rect.width / 2), units.y(rect.y + rect.height / 2))
         .size(size)
         .align(TextAlignment.Center)
         .color(theme.text)
         .layer(Layer.Legend + 2)
         .fixed()
}