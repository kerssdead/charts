import { getLabelsInRows } from '@/render/gauge/GaugeValueLabels'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting gauge value labels in rows', () => {
    it('Should place labels in rows one by one when first fits', () => {
        const labels = [{ key: 'a', text: 'abc' }, { key: 'b', text: 'de' }]

        expect(getLabelsInRows(labels, 100, 3).map(label => [label.key, label.rowIndex]))
            .toEqual([['a', 0], ['b', 1]])
    })

    it('Should skip first row when label is wider than it', () => {
        const labels = [{ key: 'a', text: 'abcdefghijklm' }, { key: 'b', text: 'de' }]

        expect(getLabelsInRows(labels, 100, 3).map(label => [label.key, label.rowIndex]))
            .toEqual([['a', 1], ['b', 2]])
    })

    it('Should drop labels that do not fit row count', () => {
        const labels = [{ key: 'a', text: 'abcdefghijklm' }, { key: 'b', text: 'de' }]

        expect(getLabelsInRows(labels, 100, 2).map(label => label.key))
            .toEqual(['a'])
    })
})