import { normalizeTreeBarRows } from '@/helpers/ValueNormalization'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'

describe('Normalizing tree bar rows', () => {
    it('Should normalize rows, parts and nested rows', () => {
        const child = new TreeBarRow({ value: '2', parts: [new Sector({ value: '1.500' })] })
        const root = new TreeBarRow({ value: '1', color: '#abc', parts: [new Sector({ value: '3' })], children: [child] })

        normalizeTreeBarRows([root], 'de-DE')

        expect([root.value, root.color, root.parts[0].value, child.value, child.parts[0].value])
            .toEqual([1, '#aabbcc', 3, 2, 1500])
    })

    it('Should accept rows without parts and children', () => {
        const row = new TreeBarRow({ value: '1' })

        normalizeTreeBarRows([row], undefined)

        expect(row.value)
            .toBe(1)
    })

    it('Should accept missing rows', () => {
        expect(() => normalizeTreeBarRows(undefined, undefined))
            .not
            .toThrow()
    })
})