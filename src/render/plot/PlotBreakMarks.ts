import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'

const BREAK_MARK_OFFSET = 8

const BREAK_MARK_SLANT = 3

export function addColumnBreakMark(
    items: QueueItemsBuilder,
    units: Units,
    left: number,
    right: number,
    top: number
) {
    const y = top + units.y(BREAK_MARK_OFFSET)
    const slant = units.y(BREAK_MARK_SLANT)

    return items.line()
                .stop(left, y + slant)
                .stop(right, y - slant)
}

export function addBarBreakMark(
    items: QueueItemsBuilder,
    units: Units,
    top: number,
    bottom: number,
    end: number
) {
    const x = end - units.x(BREAK_MARK_OFFSET)
    const slant = units.x(BREAK_MARK_SLANT)

    return items.line()
                .stop(x - slant, bottom)
                .stop(x + slant, top)
}