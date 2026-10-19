import PieData from '@/types/data/PieData'
import TreeData, { getTreeSum } from '@/types/data/TreeData'
import { getValueRows } from '@/types/TableData'

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
})