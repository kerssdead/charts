import PieData from '@/types/data/PieData'
import TreeData, { getTreeSum } from '@/types/data/TreeData'
import { getValueRows } from '@/types/TableData'
import Sector from '@/types/Sector'

describe('Getting value rows for decomposition', () => {
    it('Should has 3 rows for circular chart', () => {
        const data = {
            values: [
                {
                    value: 1,
                    label: 'Sector 1'
                },
                {
                    value: 2,
                    label: 'Sector 2'
                },
                {
                    value: 3,
                    label: 'Sector 3'
                }
            ]
        } as PieData

        expect(getValueRows(data.values).values.length)
            .toBe(3)
    })

    it('Should has 3 rows for tree map', () => {
        const data = {
            values: [
                {
                    value: 1,
                    label: 'Cell 1'
                },
                {
                    value: 2,
                    label: 'Cell 2'
                },
                {
                    value: 3,
                    label: 'Cell 3'
                }
            ]
        } as TreeData

        expect(getValueRows(data.values).values.length)
            .toBe(3)
    })

    it('Should sum tree map sectors', () => {
        const data = {
            values: [
                {
                    label: 'Group',
                    sectors: [{ value: 2 }, { value: 3 }, { value: -1 }]
                }
            ]
        } as TreeData

        expect(getValueRows(data.values, getTreeSum).values[0].values.get('Value'))
            .toBe(5)
    })

    it('Should keep value color and disabled state', () => {
        const data = {
            values: [
                {
                    value: 1,
                    label: 'Sector 1',
                    color: '#ff0000',
                    disabled: true
                }
            ]
        } as PieData

        const row = getValueRows(data.values).values[0]

        expect([row.color, row.disabled])
            .toEqual(['#ff0000', true])
    })

    it('Should name unlabeled values with empty text', () => {
        const values = [new Sector({ value: 1 }), new Sector({ value: 2, label: 'Part' })]

        expect(getValueRows(values).values.map(row => row.name))
            .toEqual(['', 'Part'])
    })
})