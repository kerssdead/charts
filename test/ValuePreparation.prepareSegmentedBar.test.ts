import { prepareSegmentedBar } from '@/helpers/ValuePreparation'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import Sector from '@/types/Sector'

const prepare = (data: object, numberLocale?: string) => {
    const result = data as SegmentedBarData

    prepareSegmentedBar(result, numberLocale)

    return result
}

describe('Preparing segmented bar', () => {
    it('Should wrap values into sectors and stops into segmented bar stops', () => {
        const data = prepare({ values: [{ value: 1 }], stops: [{ value: 2 }] })

        expect([data.values[0] instanceof Sector, data.stops[0] instanceof SegmentedBarStop])
            .toEqual([true, true])
    })

    it('Should not default missing labels', () => {
        const data = prepare({ values: [{ value: 1 }], stops: [{ value: 2 }] })

        expect([data.values[0].label, data.stops[0].label])
            .toEqual([undefined, undefined])
    })

    it('Should count labels across values and stops', () => {
        const data = prepare({ values: [{ label: 'A' }], stops: [{ label: 'A' }] })

        expect([data.values[0].id, data.stops[0].id])
            .toEqual(['A-0', 'A-1'])
    })

    it('Should parse percent stops with number locale', () => {
        const data = prepare({ values: [], stops: [{ value: '12,5%' }] }, 'de-DE')

        expect([data.stops[0].value, data.stops[0].isPercent])
            .toEqual([12.5, true])
    })

    it('Should default missing stops to empty list', () => {
        expect(prepare({ values: [] }).stops)
            .toEqual([])
    })

    it('Should keep values and stops that are already prepared', () => {
        const sector = new Sector({ value: 1 })
        const stop = new SegmentedBarStop({ value: 2 }, undefined)
        const data = prepare({ values: [sector], stops: [stop] })

        expect([data.values[0], data.stops[0]])
            .toEqual([sector, stop])
    })

    it('Should prepare missing stops as empty', () => {
        expect(prepare({ values: [{ value: 1 }] }).stops)
            .toEqual([])
    })
})