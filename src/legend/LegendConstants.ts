import Paddings from '@/types/Paddings'
import { Layer } from '@/static/constants/Index'
import { LegendPlace } from '@/static/Enums'

export const PADDING_X = 12

export const PADDING_Y = 4

export const ITEM_HEIGHT = 20

export const ROW_GAP = 4

export const ITEM_GAP = 12

export const ITEM_EXTRA_WIDTH = 30

export const MAX_AREA_SHARE = .25

export const BUTTON_TEXT_PADDING = 12

export const ITEM_CORNER_RADIUS = 6

export const BUTTON_CORNER_RADIUS = 4

export const MARKER_CENTER_X = 11

export const MARKER_RADIUS = 3

export const TEXT_OFFSET_X = 22

export const STRIKE_OFFSET_Y = 1

export const DISABLED_TEXT_ALPHA = .5

export const CONTENT_LAYER = Layer.Legend + 2

export const RESET_KEY = 'reset'

export const SIDES: { [key in LegendPlace]: keyof Paddings } = {
    [LegendPlace.Bottom]: 'bottom',
    [LegendPlace.Left]: 'left',
    [LegendPlace.Top]: 'top',
    [LegendPlace.Right]: 'right'
}