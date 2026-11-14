import { mergeSectors } from '@/helpers/ValueMerging'
import PieData from '@/types/data/PieData'
import Sector from '@/types/Sector'
import Value from '@/types/base/Value'

const sector = (label: string | undefined, value?: number, extra: Partial<Sector> = {}) => {
    return new Sector({ label, value, ...extra })
}

function merge(values: Sector[], enableMerging?: boolean) {
    const data = { values, enableMerging } as PieData

    mergeSectors(data)

    return data.values
}

const getLabelsAndValues = (values: Value[]) => values.map(value => [value.label, value.value])

describe('Merging same label sectors', () => {
    it.each([undefined, true])('Should sum same label sectors when option is %s', enableMerging => {
        expect(getLabelsAndValues(merge([sector('A', 1), sector('B', 2), sector('A', 3)], enableMerging)))
            .toEqual([['A', 4], ['B', 2]])
    })

    it('Should keep same label sectors when disabled', () => {
        expect(getLabelsAndValues(merge([sector('A', 1), sector('A', 3)], false)))
            .toEqual([['A', 1], ['A', 3]])
    })

    it('Should treat missing value as zero', () => {
        expect(merge([sector('A'), sector('A', 3), sector('A')])[0].value)
            .toBe(3)
    })

    it('Should not add value to sector with unique label', () => {
        expect(merge([sector('A')])[0].value)
            .toBeUndefined()
    })

    it('Should keep first sector fields', () => {
        const first = sector('A', 1, { id: 'first', data: { key: 'first' }, disabled: true, pinned: true })
        const second = sector('A', 3, { id: 'second', data: { key: 'second' } })

        const merged = merge([first, second])

        expect(merged)
            .toEqual([first])
        expect(merged[0].data)
            .toEqual({ key: 'first' })
    })

    it('Should take first defined color', () => {
        const values = [sector('A', 1), sector('A', 1, { color: '#00ff00' }), sector('A', 1, { color: '#0000ff' })]

        expect(merge(values)[0].color)
            .toBe('#00ff00')
    })
})