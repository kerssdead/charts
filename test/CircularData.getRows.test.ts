import PieData from '@/types/data/PieData'

describe('Getting circular rows for decomposition', () => {
    it('Should has 3 rows', () => {
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

        expect(PieData.getRows(data).values.length)
            .toBe(3)
    })
})