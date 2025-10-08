import { Value } from '../src/types/base/Value'
import { Legend } from '../src/Legend'

describe('Calculate legend height', () => {
    test('Single row', () => {
        const items = [
            {
                label: 'Sector 1'
            } as Value,
            {
                label: 'Cell 2'
            } as Value,
            {
                label: 'Sector 3'
            } as Value
        ]

        expect(Legend.getLegendHeight(items, 500))
            .toBe(44)
    })

    test('Two rows', () => {
        const items = [
            {
                label: 'Sector 1'
            } as Value,
            {
                label: 'Cell 2'
            } as Value,
            {
                label: 'Sector 3'
            } as Value,
            {
                label: 'Cell 4'
            } as Value,
            {
                label: 'Sector 5'
            } as Value
        ]

        expect(Legend.getLegendHeight(items, 500))
            .toBe(70)
    })
})