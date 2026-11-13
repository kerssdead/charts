import Value from '@/types/base/Value'
import Size from '@/types/Size'
import { clamp } from '@/helpers/Geometry'
import { maxOf, sum } from '@/helpers/Collections'
import { stringWidth } from '@/helpers/Text'
import { truncate } from '@/helpers/TextFit'
import TextResources from '@/static/TextResources'
import { LegendPlace } from '@/static/Enums'
import {
    ITEM_EXTRA_WIDTH,
    ITEM_GAP,
    ITEM_HEIGHT,
    MAX_AREA_SHARE,
    PADDING_X,
    PADDING_Y,
    ROW_GAP
} from '@/legend/LegendConstants'

export type LegendEntry = {
    value: Value
    label: string
    x: number
    y: number
    width: number
}

export type LegendLayoutOptions = {
    values: Value[]
    place: LegendPlace
    top: number
    buttonWidth: number
}

export type LegendPlacement = {
    area: DOMRect
    entries: LegendEntry[]
}

export function getLegendLabel(value: Value) {
    return value.isBlank ? `${ value.label } ${ TextResources.noValue }` : value.label
}

export function getHorizontalPlacement({ width, height }: Size, options: LegendLayoutOptions): LegendPlacement {
    const { buttonWidth, place, top } = options
    const buttonSpace = buttonWidth > 0 ? buttonWidth + ITEM_GAP : 0
    const available = Math.max(width - (PADDING_X + buttonSpace) * 2, 0)
    const rows = getRows(options.values, available, getMaxRows(height))

    const rowsCount = Math.max(rows.length, 1)
    const areaHeight = PADDING_Y * 2 + rowsCount * ITEM_HEIGHT + (rowsCount - 1) * ROW_GAP
    const areaY = place === LegendPlace.Top ? top : height - areaHeight

    const entries: LegendEntry[] = []

    rows.forEach((items, index) => {
        const total = sum(items, item => item.width) + (items.length - 1) * ITEM_GAP

        let x = (width - total) / 2

        for (const item of items) {
            item.x = x
            item.y = areaY + PADDING_Y + index * (ITEM_HEIGHT + ROW_GAP)

            x += item.width + ITEM_GAP

            entries.push(item)
        }
    })

    return { area: new DOMRect(0, areaY, width, areaHeight), entries }
}

export function getVerticalPlacement({ width, height }: Size, options: LegendLayoutOptions): LegendPlacement {
    const { values, buttonWidth, place, top } = options
    const widest = maxOf(values, value => stringWidth(getLegendLabel(value))) + ITEM_EXTRA_WIDTH
    const minWidth = buttonWidth + PADDING_X * 2
    const preferredWidth = Math.max(widest, buttonWidth) + PADDING_X * 2
    const areaWidth = Math.max(Math.min(preferredWidth, width * MAX_AREA_SHARE), minWidth)
    const available = areaWidth - PADDING_X * 2
    const areaX = place === LegendPlace.Left ? 0 : width - areaWidth

    const buttonSpace = buttonWidth > 0 ? ITEM_HEIGHT + ROW_GAP : 0
    const availableHeight = height - top - PADDING_Y * 2 - buttonSpace
    const count = clamp(Math.floor((availableHeight + ROW_GAP) / (ITEM_HEIGHT + ROW_GAP)), 0, values.length)
    const blockHeight = count * ITEM_HEIGHT + Math.max(count - 1, 0) * ROW_GAP
    const startY = top + PADDING_Y + buttonSpace + Math.max((availableHeight - blockHeight) / 2, 0)

    const entries = values.slice(0, count).map((value, index) => {
        return { ...getEntry(value, available), y: startY + index * (ITEM_HEIGHT + ROW_GAP) }
    })

    const blockWidth = maxOf(entries, entry => entry.width)

    for (const entry of entries)
        entry.x = areaX + (areaWidth - blockWidth) / 2

    return { area: new DOMRect(areaX, top, areaWidth, height - top), entries }
}

function getMaxRows(height: number) {
    const rowsHeight = height * MAX_AREA_SHARE - PADDING_Y * 2

    return Math.max(Math.floor((rowsHeight + ROW_GAP) / (ITEM_HEIGHT + ROW_GAP)), 1)
}

function getRows(values: Value[], available: number, maxRows: number) {
    const rows: LegendEntry[][] = []

    let row: LegendEntry[] = []
    let rowWidth = 0

    for (const value of values) {
        const entry = getEntry(value, available)

        if (row.length > 0 && rowWidth + ITEM_GAP + entry.width > available) {
            rows.push(row)

            row = []
            rowWidth = 0
        }

        if (rows.length === maxRows)
            break

        rowWidth += (row.length > 0 ? ITEM_GAP : 0) + entry.width

        row.push(entry)
    }

    if (row.length > 0 && rows.length < maxRows)
        rows.push(row)

    return rows
}

function getEntry(value: Value, available: number): LegendEntry {
    const label = truncate(getLegendLabel(value), available - ITEM_EXTRA_WIDTH)

    return { value, label, x: 0, y: 0, width: Math.min(stringWidth(label) + ITEM_EXTRA_WIDTH, available) }
}