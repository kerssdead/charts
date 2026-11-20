import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'
import QueueLineItemBuilder from '@/builders/QueueLineItemBuilder'
import QueueTextItemBuilder from '@/builders/QueueTextItemBuilder'
import Units from '@/helpers/Units'
import Span from '@/types/Span'
import { short, stringWidth } from '@/helpers/Text'
import { FadeEdge, HorizontalAlignment, PlotType, TextAlignment, TextBaseline, VerticalAlignment } from '@/static/Enums'
import { COORDS_MAX_X } from '@/static/constants/Index'
import PlotSeries from '@/types/PlotSeries'
import { getY } from '@/types/PlotPoint'
import { maxOf } from '@/helpers/Collections'
import { getStackKey } from '@/render/plot/PlotColumnGroups'

const FADE_SIZE = 12

const CARET_SIZE = 4

const CARET_GAP = 3

const VALUE_GAP = 2

const CAP_VALUE_FONT = 11

const COLUMN_CAP_HEIGHT = CARET_GAP + CARET_SIZE + VALUE_GAP + CAP_VALUE_FONT

const BAR_CAP_WIDTH = CARET_GAP + CARET_SIZE + VALUE_GAP

export type CapPosition = {
    span: Span
    edge: number
    value: number
}

export type CapMarks = {
    fade: QueueRectangleItemBuilder
    caret: QueueLineItemBuilder
    value: QueueTextItemBuilder | null
}

export function addColumnCapMarks(
    items: QueueItemsBuilder,
    units: Units,
    { span: column, edge: top, value }: CapPosition
): CapMarks {
    const width = column.end - column.start
    const center = column.start + width / 2
    const caretBottom = top - units.y(CARET_GAP)
    const caretTop = caretBottom - units.y(CARET_SIZE)
    const caretHalf = units.x(CARET_SIZE)

    const fade = items.rect()
                      .position(column.start, top)
                      .size(width, units.y(FADE_SIZE))
                      .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                      .fill()
                      .fadeEdge(FadeEdge.Top)

    const caret = items.line()
                       .stop(center - caretHalf, caretBottom)
                       .stop(center, caretTop)
                       .stop(center + caretHalf, caretBottom)

    const label = short(value, true)
    const labelBottom = caretTop - units.y(VALUE_GAP)
    const fits = stringWidth(label, CAP_VALUE_FONT) <= units.toPxX(width)
                 && labelBottom - units.y(CAP_VALUE_FONT) >= 0

    const valueLabel = fits
                       ? items.text(label)
                              .position(center, labelBottom)
                              .size(CAP_VALUE_FONT)
                              .align(TextAlignment.Center)
                       : null

    return { fade, caret, value: valueLabel }
}

export function addBarCapMarks(
    items: QueueItemsBuilder,
    units: Units,
    { span: bar, edge: end, value }: CapPosition
): CapMarks {
    const height = bar.end - bar.start
    const middle = bar.start + height / 2
    const fadeWidth = units.x(FADE_SIZE)
    const caretLeft = end + units.x(CARET_GAP)
    const caretRight = caretLeft + units.x(CARET_SIZE)
    const caretHalf = units.y(CARET_SIZE)

    const fade = items.rect()
                      .position(end - fadeWidth, bar.start)
                      .size(fadeWidth, height)
                      .align(HorizontalAlignment.Left, VerticalAlignment.Top)
                      .fill()
                      .fadeEdge(FadeEdge.Right)

    const caret = items.line()
                       .stop(caretLeft, middle - caretHalf)
                       .stop(caretRight, middle)
                       .stop(caretLeft, middle + caretHalf)

    const label = short(value, true)
    const labelLeft = caretRight + units.x(VALUE_GAP)
    const fits = CAP_VALUE_FONT <= units.toPxY(height)
                 && labelLeft + units.x(stringWidth(label, CAP_VALUE_FONT)) <= COORDS_MAX_X

    const valueLabel = fits
                       ? items.text(label)
                              .position(labelLeft, middle)
                              .size(CAP_VALUE_FONT)
                              .align(TextAlignment.Left)
                              .baseline(TextBaseline.Middle)
                       : null

    return { fade, caret, value: valueLabel }
}

export function getCapRoom(units: Units, series: PlotSeries[], yMax: number | undefined, isBarOnly: boolean) {
    if (yMax === undefined)
        return { top: 0, right: 0 }

    const columns = getColumnTotals(series).filter(total => total > yMax)
    const bars = isBarOnly ? getValues(series, PlotType.Bar).filter(value => value > yMax) : []
    const widestBar = maxOf(bars, value => stringWidth(short(value, true), CAP_VALUE_FONT))

    return {
        top: columns.length > 0 ? units.y(COLUMN_CAP_HEIGHT) : 0,
        right: bars.length > 0 ? units.x(BAR_CAP_WIDTH + widestBar) : 0
    }
}

function getValues(series: PlotSeries[], type: PlotType) {
    return series.filter(item => item.type === type)
                 .flatMap(item => item.values.map(value => getY(value) ?? 0))
}

function getColumnTotals(series: PlotSeries[]) {
    const stacks = new Map<string, number>()

    for (const item of series.filter(item => item.type === PlotType.StackingColumn))
        for (const value of item.values)
            stacks.set(getStackKey(value), (stacks.get(getStackKey(value)) ?? 0) + (getY(value) ?? 0))

    return [...getValues(series, PlotType.Column), ...stacks.values()]
}