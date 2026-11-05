import { getMatchingValues } from '@/types/TableData'
import TableValue from '@/types/TableValue'

const row = (name: string, level?: number): TableValue => ({ name, level, values: new Map() })

const names = (values: TableValue[], query: string) => {
    const matching = getMatchingValues(values, query)

    return values.filter(value => matching.has(value)).map(value => value.name)
}

describe('Getting table values matching a filter', () => {
    it('Should match every value for an empty query', () => {
        expect(names([row('Apple'), row('Banana')], ''))
            .toEqual(['Apple', 'Banana'])
    })

    it('Should match every value for a whitespace query', () => {
        expect(names([row('Apple'), row('Banana')], '   '))
            .toEqual(['Apple', 'Banana'])
    })

    it('Should match names containing the query ignoring case', () => {
        expect(names([row('Green apple'), row('Banana'), row('APPLE pie')], 'apple'))
            .toEqual(['Green apple', 'APPLE pie'])
    })

    it('Should trim the query', () => {
        expect(names([row('Apple'), row('Banana')], '  ban '))
            .toEqual(['Banana'])
    })

    it('Should match nothing when no name contains the query', () => {
        expect(names([row('Apple'), row('Banana')], 'cherry'))
            .toEqual([])
    })

    it('Should keep all ancestors of a matching child', () => {
        const values = [row('Fruits'), row('Citrus', 1), row('Lemon', 2), row('Vegetables'), row('Potato', 1)]

        expect(names(values, 'lemon'))
            .toEqual(['Fruits', 'Citrus', 'Lemon'])
    })

    it('Should not keep siblings or children of a matching parent', () => {
        const values = [row('Fruits'), row('Citrus', 1), row('Lemon', 2), row('Berries', 1)]

        expect(names(values, 'citrus'))
            .toEqual(['Fruits', 'Citrus'])
    })
})