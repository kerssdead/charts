import { mergeSeries } from '@/helpers/ValueMerging'
import PlotData from '@/types/data/PlotData'
import PlotSeries from '@/types/PlotSeries'

const series = (label: string, values: PlotSeries['values'], extra: Partial<PlotSeries> = {}) => {
    return new PlotSeries({ label, values, ...extra })
}

function merge(values: PlotSeries[], enableMerging: boolean | undefined = true) {
    const data = { values, enableMerging } as PlotData

    mergeSeries(data)

    return data.values
}

describe('Merging same label plot series', () => {
    it.each([undefined, false])('Should keep same label plot series when option is %s', enableMerging => {
        const data = { values: [series('A', [{ x: 1, y: 1 }]), series('A', [{ x: 1, y: 3 }])], enableMerging }

        mergeSeries(data as PlotData)

        expect(data.values)
            .toHaveLength(2)
    })

    it('Should sum plot y per x and add missing x when enabled', () => {
        const merged = merge([
            series('A', [{ x: 'a', y: 1 }, { x: 'b', y: 2 }]),
            series('B', [{ x: 'a', y: 9 }]),
            series('A', [{ x: 'b', y: 3 }, { x: 'c', y: 4 }]),
            series('A', [{ x: 'c', y: 5 }])
        ])

        expect(merged.map(value => value.label))
            .toEqual(['A', 'B'])
        expect(merged[0].values)
            .toEqual([{ x: 'a', y: 1 }, { x: 'b', y: 5 }, { x: 'c', y: 9 }])
    })

    it('Should match plot points by date', () => {
        const merged = merge([
            series('A', [{ x: new Date(2026, 0, 1), y: 1 }]),
            series('A', [{ x: new Date(2026, 0, 1), y: 3 }])
        ])

        expect(merged[0].values.map(point => point.y))
            .toEqual([4])
    })

    it('Should keep first plot series style', () => {
        const merged = merge([series('A', [], { width: 1, dash: [1] }), series('A', [], { width: 2, dash: [2] })])

        expect(merged[0])
            .toMatchObject({ width: 1, dash: [1] })
    })

    it('Should add points to plot series without values', () => {
        const merged = merge([
            new PlotSeries({ label: 'A' }),
            series('A', [{ x: 1, y: 3 }]),
            new PlotSeries({ label: 'A' })
        ])

        expect(merged[0].values)
            .toEqual([{ x: 1, y: 3 }])
    })

    it('Should keep defined y when merging with missing y', () => {
        const merged = merge([
            series('A', [{ x: 'a', y: null }, { x: 'b', y: 2 }]),
            series('A', [{ x: 'a', y: 3 }, { x: 'b', y: null }])
        ])

        expect(merged[0].values.map(point => point.y))
            .toEqual([3, 2])
    })

    it('Should keep y missing when merging two missing y', () => {
        const merged = merge([series('A', [{ x: 'a', y: null }]), series('A', [{ x: 'a', y: null }])])

        expect(merged[0].values[0].y)
            .toBeNull()
    })
})