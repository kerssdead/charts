import TreeData from '@/types/data/TreeData'
import { getValueRows } from '@/types/TableData'

describe('Getting tree map rows for decomposition', () => {
    it('Should has 3 rows', () => {
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
})