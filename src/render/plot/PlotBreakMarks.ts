import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import Span from '@/types/Span'

const BREAK_MARK_OFFSET = 8

const BREAK_MARK_SLANT = 3

export function addColumnBreakMark(items: QueueItemsBuilder, units: Units, columnSpan: Span, top: number) {
    const y = top + units.y(BREAK_MARK_OFFSET)
    const slant = units.y(BREAK_MARK_SLANT)

    return items.line()
                .stop(columnSpan.start, y + slant)
                .stop(columnSpan.end, y - slant)
}

export function addBarBreakMark(items: QueueItemsBuilder, units: Units, barSpan: Span, end: number) {
    const x = end - units.x(BREAK_MARK_OFFSET)
    const slant = units.x(BREAK_MARK_SLANT)

    return items.line()
                .stop(x - slant, barSpan.end)
                .stop(x + slant, barSpan.start)
}