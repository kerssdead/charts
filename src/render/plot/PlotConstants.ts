import { Layer } from '@/static/constants/Index'
import { PlotType } from '@/static/Enums'

export const MAX_SLOT_GAP = 30

export const SLOT_GAP_RATIO = 0.2

export const LEFT_PADDING = 8

export const LEFT_GAP = 8

export const AXIS_TITLE_FONT = 14

export const AXIS_LABEL_FONT = 14

export const AXIS_VALUE_COUNT = 5

export const BOTTOM_PADDING = 6

export const BOTTOM_GAP = 6

export const X_LABEL_FONT = 12

export const X_LABEL_SPACING = 8

export const TOP_BASELINE_GAP = 4

export const BAND_SPACING = 24

export const BAR_BAND_RATIO = 0.35

export const CORNER_RADIUS = 80

export const SIMPLE_MARGIN = 50

export const TOP_MARGIN = 200

export const RIGHT_MARGIN = 100

export const X_LABEL_HEIGHT = X_LABEL_FONT * 1.3

export const Y_LABEL_HEIGHT = AXIS_LABEL_FONT * 1.3

export const GRID_DASH = [1, 20]

export const LINE_LAYER = Layer.Data + 1

export const AXIS_LAYER = Layer.Data + 50

export const GHOST_TYPES = [PlotType.Column, PlotType.Bar, PlotType.StackingColumn]