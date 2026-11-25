import { getHeatMapRows } from '@/export/TableRows'
import { isDisabledByFlag } from './ViewStateTestData'
import { labeled, points } from './HeatMapTestData'

describe('Getting heat map rows', () => {
    it('Should make a column for every column label', () => {
        const table = getHeatMapRows(labeled([['Mon', '8h', 1], ['Tue', '8h', 2]]), isDisabledByFlag)

        expect(table.headers)
            .toEqual([{ value: 'Mon', display: 'Mon' }, { value: 'Tue', display: 'Tue' }])
    })

    it('Should make a row for every row label', () => {
        const table = getHeatMapRows(labeled([['Mon', '8h', 1], ['Mon', '12h', 2]]), isDisabledByFlag)

        expect(table.values.map(row => row.name))
            .toEqual(['8h', '12h'])
    })

    it('Should put every value in its row and column', () => {
        const table = getHeatMapRows(labeled([['Mon', '8h', 1], ['Tue', '8h', 2], ['Mon', '12h', 3]]), isDisabledByFlag)

        expect([...table.values[0].values])
            .toEqual([['Mon', 1], ['Tue', 2]])
        expect([...table.values[1].values])
            .toEqual([['Mon', 3]])
    })

    it('Should leave missing cells empty', () => {
        const table = getHeatMapRows(labeled([['Mon', '8h', 1], ['Tue', '12h', 3]]), isDisabledByFlag)

        expect(table.values[0].values.has('Tue'))
            .toBe(false)
    })

    it('Should follow the given label order', () => {
        const data = labeled([['a', 'p', 1], ['b', 'q', 2]], { xLabels: ['b', 'a'], yLabels: ['q', 'p'] })
        const table = getHeatMapRows(data, isDisabledByFlag)

        expect(table.headers.map(header => header.value))
            .toEqual(['b', 'a'])
        expect(table.values.map(row => row.name))
            .toEqual(['q', 'p'])
    })

    it('Should color rows with the heat map color and never disable them', () => {
        const [row] = getHeatMapRows(labeled([['a', 'p', 1]], { color: '#112233' }), () => true).values

        expect(row.color)
            .toBe('#112233')
        expect(row.disabled)
            .toBe(false)
    })

    it('Should list every point as a row', () => {
        const table = getHeatMapRows(points([[1, 2, 3], [4, 5, 6]]), isDisabledByFlag)

        expect(table.values.map(row => row.name))
            .toEqual(['x 1, y 2', 'x 4, y 5'])
        expect(table.values.map(row => row.values.get('Value')))
            .toEqual([3, 6])
    })
})