export { default as AnimationTiming } from '@/static/constants/AnimationTiming'
export { default as Layer } from '@/static/constants/Layer'
export { default as ContextMenu } from '@/static/constants/ContextMenu'
export { default as Tooltip } from '@/static/constants/Tooltip'

export const COORDS_MAX_X = 5000
export const COORDS_MAX_Y = 5000

export const CANVAS_CENTER = { x: COORDS_MAX_X / 2, y: COORDS_MAX_Y / 2 }

export const FULL_ANGLE = Math.PI * 2

export const DEFAULT_LINE_WIDTH = 1

export const FONT_FAMILY = 'Arial'

export const ZOOM_MIN = .5
export const ZOOM_MAX = 1.5
export const ZOOM_DEFAULT_STEP = .05

export const PAN_MIN_VISIBLE = .25