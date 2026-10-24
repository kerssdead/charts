import { stringWidth } from '@/helpers/Text'
import { LABEL_FONT_SIZE } from '@/render/gauge/GaugeConstants'

export type ValueLabel = {
    key: string
    text: string
}

export type ValueLabelInRow = ValueLabel & {
    rowIndex: number
}

export function getLabelsInRows(
    labels: ValueLabel[],
    firstRowWidth: number,
    rowCount: number
): ValueLabelInRow[] {
    const labelsInRows: ValueLabelInRow[] = []

    let rowIndex = 0

    for (const label of labels) {
        if (rowIndex == 0 && stringWidth(label.text, LABEL_FONT_SIZE) > firstRowWidth)
            rowIndex++

        if (rowIndex >= rowCount)
            break

        labelsInRows.push({ ...label, rowIndex: rowIndex++ })
    }

    return labelsInRows
}