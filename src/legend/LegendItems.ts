import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import { ThemePalette } from '@/Theme'
import { grayScale, withAlpha } from '@/helpers/Color'
import { stringWidth } from '@/helpers/Text'
import TextResources from '@/static/TextResources'
import { DEFAULT_FONT_SIZE } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { addButtonRect, addButtonText } from '@/renderer/OverlayButtons'
import { LegendEntry } from '@/legend/LegendLayout'
import {
    BUTTON_CORNER_RADIUS,
    CONTENT_LAYER,
    DISABLED_TEXT_ALPHA,
    ITEM_CORNER_RADIUS,
    ITEM_HEIGHT,
    MARKER_CENTER_X,
    MARKER_RADIUS,
    STRIKE_OFFSET_Y,
    TEXT_OFFSET_X
} from '@/legend/LegendConstants'

export type LegendButtonState = {
    hover: number
    onClick: () => void
    theme: ThemePalette
}

export type LegendEntryState = LegendButtonState & {
    isDisabled: boolean
}

export function addLegendEntry(
    items: QueueItemsBuilder,
    units: Units,
    entry: LegendEntry,
    { hover, isDisabled, onClick, theme }: LegendEntryState
) {
    const { value, label, x, y, width } = entry
    const centerY = y + ITEM_HEIGHT / 2
    const textX = x + TEXT_OFFSET_X
    const isMuted = isDisabled || value.isBlank
    const textColor = isMuted ? withAlpha(theme.text, DISABLED_TEXT_ALPHA) : theme.text

    const background = addButtonRect(items, units, {
        rect: { x, y, width, height: ITEM_HEIGHT },
        radius: ITEM_CORNER_RADIUS,
        hover,
        onClick
    }, theme)

    items.arc()
         .position(units.x(x + MARKER_CENTER_X), units.y(centerY))
         .radius(units.x(MARKER_RADIUS))
         .fill()
         .color(isMuted ? grayScale(value.color) : value.color)
         .layer(CONTENT_LAYER)
         .fixed()

    items.text(label)
         .position(units.x(textX), units.y(centerY))
         .size(DEFAULT_FONT_SIZE)
         .align(TextAlignment.Left)
         .color(textColor)
         .layer(CONTENT_LAYER)
         .fixed()

    if (isMuted)
        items.line()
             .stop(units.x(textX), units.y(centerY + STRIKE_OFFSET_Y))
             .stop(units.x(textX + stringWidth(label)), units.y(centerY + STRIKE_OFFSET_Y))
             .color(textColor)
             .layer(CONTENT_LAYER)
             .fixed()

    return background.build()
}

export function addResetButton(
    items: QueueItemsBuilder,
    units: Units,
    button: DOMRect,
    state: LegendButtonState
) {
    const background = addButtonRect(items, units, {
        rect: button,
        radius: BUTTON_CORNER_RADIUS,
        hover: state.hover,
        onClick: state.onClick
    }, state.theme)

    addButtonText(
        items,
        units,
        { rect: button, text: TextResources.reset, size: DEFAULT_FONT_SIZE },
        state.theme
    )

    return background.build()
}