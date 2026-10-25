import TreeBarRow from '@/types/TreeBarRow'
import { short } from '@/helpers/Text'
import {
    IMAGE_GAP,
    IMAGE_SIZE,
    LABEL_FONT_SIZE,
    LINE_HEIGHT,
    ROW_MIN_HEIGHT,
    ROW_PADDING,
    SUB_LABEL_FONT_SIZE,
    TOGGLE_WIDTH
} from '@/render/treeBar/TreeBarConstants'

export type Line = {
    text: string
    isSubLabel: boolean
}

export function getLines(node: TreeBarRow): Line[] {
    const lines = node.label.split('\n').map(text => ({ text, isSubLabel: false }))

    return node.subLabel ? [...lines, { text: node.subLabel, isSubLabel: true }] : lines
}

export function getLineFontSize(line: Line) {
    return line.isSubLabel ? SUB_LABEL_FONT_SIZE : LABEL_FONT_SIZE
}

export function getRowHeight(node: TreeBarRow) {
    return Math.max(ROW_MIN_HEIGHT, getLines(node).length * LINE_HEIGHT + ROW_PADDING * 2)
}

export function getTextOffset(node: TreeBarRow) {
    return TOGGLE_WIDTH + (node.image ? IMAGE_SIZE + IMAGE_GAP : 0)
}

export function formatCell(value: string | number | undefined) {
    return typeof value == 'number' ? short(value, false) : value ?? ''
}