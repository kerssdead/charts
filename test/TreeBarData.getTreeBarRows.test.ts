import TreeBarData, { getTreeBarRows } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'

const part = (value: number) => new Sector({ value, color: '#ff0000' })

const row = (id: string, values: number[], extra: Partial<TreeBarRow> = {}) => {
    return new TreeBarRow({ id, label: id, parts: values.map(part), ...extra })
}

describe('Getting tree bar rows for decomposition', () => {
    it('Should export rows with column values', () => {
        const table = getTreeBarRows({
            values: [row('a', [1], { label: 'Lorem\nIpsum', cells: { amount: '1,500', code: 'XY' } })],
            columns: [{ key: 'amount', title: 'Amount' }, { key: 'code', title: 'Code' }]
        } as TreeBarData)

        expect([table.headers.map(header => header.display), table.values.map(value => [value.name, [...value.values.values()]])])
            .toEqual([['Amount', 'Code'], [['Lorem Ipsum', [1500, 0]]]])
    })

    it('Should export part totals without columns', () => {
        const table = getTreeBarRows({ values: [row('a', [10, 20])] } as TreeBarData)

        expect([...table.values[0].values.values()])
            .toEqual([30])
    })

    it('Should export children after their parent with their depth', () => {
        const table = getTreeBarRows({
            values: [
                row('a', [1], { children: [row('a1', [1], { children: [row('a1x', [1])] })] }),
                row('b', [1])
            ]
        } as TreeBarData)

        expect(table.values.map(value => [value.name, value.level]))
            .toEqual([['a', 0], ['a1', 1], ['a1x', 2], ['b', 0]])
    })

    it('Should export collapsed children', () => {
        const table = getTreeBarRows({
            values: [row('a', [1], { expanded: false, children: [row('a1', [1])] })]
        } as TreeBarData)

        expect(table.values.map(value => value.name))
            .toEqual(['a', 'a1'])
    })

    it('Should keep row color and disabled state', () => {
        const table = getTreeBarRows({
            values: [row('a', [1], { color: '#0000ff', disabled: true, cells: { amount: 1 } })],
            columns: [{ key: 'amount', title: 'Amount' }]
        } as TreeBarData)

        expect([table.values[0].color, table.values[0].disabled])
            .toEqual(['#0000ff', true])
    })
})