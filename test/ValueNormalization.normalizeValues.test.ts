import { normalizeValues } from '@/helpers/ValueNormalization'
import Value from '@/types/base/Value'

const normalize = (fields: object[], numberLocale?: string) => {
    const values = fields.map(field => new Value(field))

    normalizeValues(values, numberLocale)

    return values
}

describe('Normalizing values', () => {
    it('Should parse number strings', () => {
        expect(normalize([{ value: '12' }, { value: 3 }]).map(value => value.value))
            .toEqual([12, 3])
    })

    it('Should parse numbers with number locale', () => {
        expect(normalize([{ value: '1.234,5' }], 'de-DE')[0].value)
            .toBe(1234.5)
    })

    it('Should replace invalid numbers with null', () => {
        expect(normalize([{ value: 'abc' }, { value: '' }, { value: NaN }, { value: Infinity }]).map(value => value.value))
            .toEqual([null, null, null, null])
    })

    it('Should keep missing values', () => {
        expect(normalize([{}])[0].value)
            .toBeUndefined()
    })

    it('Should normalize colors', () => {
        expect(normalize([{ color: '#abc' }])[0].color)
            .toBe('#aabbcc')
    })

    it('Should accept missing values list', () => {
        expect(() => normalizeValues(undefined, undefined))
            .not
            .toThrow()
    })
})