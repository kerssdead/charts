import { stringWidth } from '@/helpers/Text'

export function truncate(label: string, maxWidth: number, font?: number) {
    if (stringWidth(label, font) <= maxWidth)
        return label

    const chars = Array.from(label)

    let low = 0
    let high = chars.length - 1

    while (low < high) {
        const middle = Math.ceil((low + high) / 2)

        if (stringWidth(chars.slice(0, middle).join('') + '…', font) <= maxWidth)
            low = middle
        else
            high = middle - 1
    }

    return chars.slice(0, low).join('') + '…'
}