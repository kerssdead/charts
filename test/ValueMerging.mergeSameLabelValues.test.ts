import { mergeSameLabelValues } from '@/helpers/ValueMerging'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import Value from '@/types/base/Value'
import PlotSeries from '@/types/PlotSeries'
import Sector from '@/types/Sector'
import { TreeValue } from '@/types/data/TreeData'

const sector = (label: string | undefined, value?: number, extra: Partial<Sector> = {}) => {
    return new Sector({ label, value, ...extra })
}

const group = (label: string, sectors: Value[], extra: Partial<TreeValue> = {}) => {
    return new Sector({ label, sectors, ...extra }) as TreeValue
}

const series = (label: string, values: PlotSeries['values'], extra: Partial<PlotSeries> = {}) => {
    return new PlotSeries({ label, values, ...extra })
}

function merge<T extends Value>(type: ChartType, values: T[], enableMerging?: boolean) {
    const chart = { type, data: { values, enableMerging } } as unknown as ChartItem

    mergeSameLabelValues(chart)

    return chart.data.values as T[]
}

const getLabelsAndValues = (values?: Value[]) => values?.map(value => [value.label, value.value])

describe('Merging same label values', () => {
    it.each([ChartType.Pie, ChartType.Gauge])('Should sum same label sectors by default in chart type %s', type => {
        const merged = merge(type, [sector('A', 1), sector('B', 2), sector('A', 3)])

        expect(getLabelsAndValues(merged))
            .toEqual([['A', 4], ['B', 2]])
    })

    it.each([ChartType.Pie, ChartType.Gauge, ChartType.TreeMap])(
        'Should keep same label values when disabled in chart type %s',
        type => {
            const merged = merge(type, [sector('A', 1), sector('A', 3)], false)

            expect(getLabelsAndValues(merged))
                .toEqual([['A', 1], ['A', 3]])
        }
    )

    it('Should treat missing value as zero', () => {
        const merged = merge(ChartType.Pie, [sector('A'), sector('A', 3), sector('A')])

        expect(merged[0].value)
            .toBe(3)
    })

    it('Should not add value to sector with unique label', () => {
        const merged = merge(ChartType.Pie, [sector('A')])

        expect(merged[0].value)
            .toBeUndefined()
    })

    it('Should keep first sector fields', () => {
        const first = sector('A', 1, { id: 'first', data: { key: 'first' }, disabled: true, pinned: true })
        const second = sector('A', 3, { id: 'second', data: { key: 'second' } })

        const merged = merge(ChartType.Pie, [first, second])

        expect(merged)
            .toEqual([first])
        expect(merged[0].data)
            .toEqual({ key: 'first' })
    })

    it('Should take first defined color', () => {
        const values = [sector('A', 1), sector('A', 1, { color: '#00ff00' }), sector('A', 1, { color: '#0000ff' })]

        expect(merge(ChartType.Pie, values)[0].color)
            .toBe('#00ff00')
    })

    it('Should sum same label tree values', () => {
        const merged = merge(ChartType.TreeMap, [sector('A', 1), sector('B', 2), sector('A', 3)])

        expect(getLabelsAndValues(merged))
            .toEqual([['A', 4], ['B', 2]])
    })

    it('Should join sectors of same label tree groups', () => {
        const merged = merge(ChartType.TreeMap, [
            group('A', [sector('X', 1)]),
            group('B', [sector('Y', 2)]),
            group('A', [sector('Z', 3)])
        ])

        expect(merged.map(value => value.label))
            .toEqual(['A', 'B'])
        expect(getLabelsAndValues(merged[0].sectors))
            .toEqual([['X', 1], ['Z', 3]])
    })

    it('Should sum same label sectors inside tree group', () => {
        const merged = merge(ChartType.TreeMap, [group('A', [sector('X', 1), sector('X', 3)])])

        expect(getLabelsAndValues(merged[0].sectors))
            .toEqual([['X', 4]])
    })

    it('Should sum same label sectors across merged tree groups', () => {
        const merged = merge(ChartType.TreeMap, [group('A', [sector('X', 1)]), group('A', [sector('X', 3)])])

        expect(getLabelsAndValues(merged[0].sectors))
            .toEqual([['X', 4]])
    })

    it('Should keep tree value without sectors as sector of merged group', () => {
        const leaf = () => sector('A', 5, { color: '#00ff00', data: { key: 'leaf' } })

        const [leafFirst] = merge<TreeValue>(ChartType.TreeMap, [leaf(), group('A', [sector('X', 1)])])
        const [groupFirst] = merge<TreeValue>(ChartType.TreeMap, [group('A', [sector('X', 1)]), leaf()])

        expect(getLabelsAndValues(leafFirst.sectors))
            .toEqual([['A', 5], ['X', 1]])
        expect(getLabelsAndValues(groupFirst.sectors))
            .toEqual([['X', 1], ['A', 5]])
        expect(leafFirst.sectors?.[0])
            .toMatchObject({ color: '#00ff00', data: { key: 'leaf' } })
    })

    it('Should keep unlabeled sectors inside tree group separate', () => {
        const merged = merge(ChartType.TreeMap, [group('A', [sector(undefined, 1), sector(undefined, 3)])])

        expect(getLabelsAndValues(merged[0].sectors))
            .toEqual([[undefined, 1], [undefined, 3]])
    })

    it.each([undefined, false])('Should keep same label plot series when option is %s', enableMerging => {
        const values = [series('A', [{ x: 1, y: 1 }]), series('A', [{ x: 1, y: 3 }])]

        expect(merge(ChartType.Plot, values, enableMerging))
            .toHaveLength(2)
    })

    it('Should sum plot y per x and add missing x when enabled', () => {
        const merged = merge(ChartType.Plot, [
            series('A', [{ x: 'a', y: 1 }, { x: 'b', y: 2 }]),
            series('B', [{ x: 'a', y: 9 }]),
            series('A', [{ x: 'b', y: 3 }, { x: 'c', y: 4 }]),
            series('A', [{ x: 'c', y: 5 }])
        ], true)

        expect(merged.map(value => value.label))
            .toEqual(['A', 'B'])
        expect(merged[0].values)
            .toEqual([{ x: 'a', y: 1 }, { x: 'b', y: 5 }, { x: 'c', y: 9 }])
    })

    it('Should match plot points by date', () => {
        const merged = merge(ChartType.Plot, [
            series('A', [{ x: new Date(2026, 0, 1), y: 1 }]),
            series('A', [{ x: new Date(2026, 0, 1), y: 3 }])
        ], true)

        expect(merged[0].values.map(point => point.y))
            .toEqual([4])
    })

    it('Should keep first plot series style', () => {
        const merged = merge(ChartType.Plot, [
            series('A', [], { width: 1, dash: [1] }),
            series('A', [], { width: 2, dash: [2] })
        ], true)

        expect(merged[0])
            .toMatchObject({ width: 1, dash: [1] })
    })

    it('Should add points to plot series without values', () => {
        const merged = merge(ChartType.Plot, [
            new PlotSeries({ label: 'A' }),
            series('A', [{ x: 1, y: 3 }]),
            new PlotSeries({ label: 'A' })
        ], true)

        expect(merged[0].values)
            .toEqual([{ x: 1, y: 3 }])
    })

    it.each([ChartType.SegmentedBar, ChartType.TreeBar])('Should not merge in chart type %s', type => {
        const values = [sector('A', 1), sector('A', 3)]

        expect(merge(type, values, true))
            .toHaveLength(2)
    })

    it('Should skip chart without values', () => {
        const chart = { type: ChartType.Pie } as unknown as ChartItem

        expect(() => mergeSameLabelValues(chart))
            .not
            .toThrow()
    })

    it('Should keep defined y when merging with missing y', () => {
        const merged = merge(ChartType.Plot, [
            series('A', [{ x: 'a', y: null }, { x: 'b', y: 2 }]),
            series('A', [{ x: 'a', y: 3 }, { x: 'b', y: null }])
        ], true)

        expect(merged[0].values.map(point => point.y))
            .toEqual([3, 2])
    })

    it('Should keep y missing when merging two missing y', () => {
        const merged = merge(ChartType.Plot, [
            series('A', [{ x: 'a', y: null }]),
            series('A', [{ x: 'a', y: null }])
        ], true)

        expect(merged[0].values[0].y)
            .toBeNull()
    })
})