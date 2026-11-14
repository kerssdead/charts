import { mergeTreeValues } from '@/helpers/ValueMerging'
import TreeData, { TreeValue } from '@/types/data/TreeData'
import Sector from '@/types/Sector'
import Value from '@/types/base/Value'

const sector = (label: string | undefined, value?: number, extra: Partial<TreeValue> = {}) => {
    return new Sector({ label, value, ...extra }) as TreeValue
}

const group = (label: string, sectors: Value[]) => new Sector({ label, sectors }) as TreeValue

function merge(values: TreeValue[], enableMerging?: boolean) {
    const data = { values, enableMerging } as TreeData

    mergeTreeValues(data)

    return data.values
}

const getLabelsAndValues = (values?: Value[]) => values?.map(value => [value.label, value.value])

describe('Merging same label tree values', () => {
    it('Should sum same label tree values', () => {
        expect(getLabelsAndValues(merge([sector('A', 1), sector('B', 2), sector('A', 3)])))
            .toEqual([['A', 4], ['B', 2]])
    })

    it('Should keep same label tree values when disabled', () => {
        expect(getLabelsAndValues(merge([sector('A', 1), sector('A', 3)], false)))
            .toEqual([['A', 1], ['A', 3]])
    })

    it('Should join sectors of same label tree groups', () => {
        const merged = merge([group('A', [sector('X', 1)]), group('B', [sector('Y', 2)]), group('A', [sector('Z', 3)])])

        expect(merged.map(value => value.label))
            .toEqual(['A', 'B'])
        expect(getLabelsAndValues(merged[0].sectors))
            .toEqual([['X', 1], ['Z', 3]])
    })

    it('Should sum same label sectors inside tree group', () => {
        expect(getLabelsAndValues(merge([group('A', [sector('X', 1), sector('X', 3)])])[0].sectors))
            .toEqual([['X', 4]])
    })

    it('Should sum same label sectors across merged tree groups', () => {
        expect(getLabelsAndValues(merge([group('A', [sector('X', 1)]), group('A', [sector('X', 3)])])[0].sectors))
            .toEqual([['X', 4]])
    })

    it('Should keep tree value without sectors as sector of merged group', () => {
        const leaf = () => sector('A', 5, { color: '#00ff00', data: { key: 'leaf' } })

        const [leafFirst] = merge([leaf(), group('A', [sector('X', 1)])])
        const [groupFirst] = merge([group('A', [sector('X', 1)]), leaf()])

        expect(getLabelsAndValues(leafFirst.sectors))
            .toEqual([['A', 5], ['X', 1]])
        expect(getLabelsAndValues(groupFirst.sectors))
            .toEqual([['X', 1], ['A', 5]])
        expect(leafFirst.sectors?.[0])
            .toMatchObject({ color: '#00ff00', data: { key: 'leaf' } })
    })

    it('Should keep unlabeled sectors inside tree group separate', () => {
        expect(getLabelsAndValues(merge([group('A', [sector(undefined, 1), sector(undefined, 3)])])[0].sectors))
            .toEqual([[undefined, 1], [undefined, 3]])
    })
})