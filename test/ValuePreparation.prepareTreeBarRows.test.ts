import { prepareTreeBarRows } from '@/helpers/ValuePreparation'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'

const prepare = (values: object[], numberLocale?: string) => {
    const data = { values } as TreeBarData

    prepareTreeBarRows(data, numberLocale)

    return data
}

describe('Preparing tree bar rows', () => {
    it('Should wrap nested rows and parts', () => {
        const [root] = prepare([{ label: 'A', parts: [{ value: 1 }], children: [{ label: 'B' }] }]).values

        const child = root.children?.[0]

        expect([root instanceof TreeBarRow, child instanceof TreeBarRow, root.parts[0] instanceof Sector])
            .toEqual([true, true, true])
    })

    it('Should default row labels but not part labels', () => {
        const [root] = prepare([{ parts: [{ value: 1 }] }]).values

        expect([root.label, root.parts[0].label])
            .toEqual([TextResources.noLabel, undefined])
    })

    it('Should default missing parts to empty list', () => {
        expect(prepare([{ label: 'A' }]).values[0].parts)
            .toEqual([])
    })

    it('Should count labels across all rows', () => {
        const [root] = prepare([{ label: 'A', children: [{ label: 'A' }] }]).values

        expect([root.id, root.children?.[0].id])
            .toEqual(['A-0', 'A-1'])
    })

    it('Should keep number locale for cells', () => {
        expect(prepare([], 'de-DE').numberLocale)
            .toBe('de-DE')
    })

    it('Should keep rows and parts that are already prepared', () => {
        const part = new Sector({ value: 1 })
        const row = new TreeBarRow({ label: 'A', parts: [part] })
        const [prepared] = prepare([row]).values

        expect([prepared, prepared.parts[0]])
            .toEqual([row, part])
    })

    it('Should prepare rows without parts', () => {
        expect(prepare([{ label: 'A' }]).values[0].parts)
            .toEqual([])
    })
})