import { normalizeTreeValues } from '@/helpers/ValueNormalization'
import TreeData from '@/types/data/TreeData'
import Sector from '@/types/Sector'

describe('Normalizing tree values', () => {
    it('Should normalize tree values and their sectors', () => {
        const data = {
            values: [new Sector({ value: '4', color: '#abc', sectors: [new Sector({ value: '1,5' })] })]
        } as TreeData

        normalizeTreeValues(data, 'de-DE')

        expect([data.values[0].value, data.values[0].color, data.values[0].sectors?.[0].value])
            .toEqual([4, '#aabbcc', 1.5])
    })

    it('Should accept tree values without sectors', () => {
        const data = { values: [new Sector({ value: '4' })] } as TreeData

        normalizeTreeValues(data, undefined)

        expect(data.values[0].value)
            .toBe(4)
    })

    it('Should accept data without values', () => {
        expect(() => normalizeTreeValues({} as TreeData, undefined))
            .not.toThrow()
    })
})