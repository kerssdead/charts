import { toTabSeparatedText } from '@/types/TableData'
import TextResources from '@/static/TextResources'

describe('Converting a table to tab separated text', () => {
    it('Should write header, rows and totals as tab separated lines', () => {
        const table = {
            headers: [{ value: 'a', display: 'A' }, { value: 'b', display: 'B' }],
            values: [
                { name: 'One', values: new Map([['a', 1], ['b', 2.5]]) },
                { name: 'Two', values: new Map([['a', 3]]) }
            ]
        }

        expect(toTabSeparatedText(table))
            .toBe(`\tA\tB\nOne\t1\t2.5\nTwo\t3\t0\n${ TextResources.total }\t4\t2.5`)
    })

    it('Should replace tabs and line breaks in names with spaces', () => {
        const table = {
            headers: [{ value: 'a', display: 'Col\tumn' }],
            values: [{ name: 'Multi\r\nline', values: new Map([['a', 1]]) }]
        }

        expect(toTabSeparatedText(table).split('\n').slice(0, 2))
            .toEqual(['\tCol umn', 'Multi line\t1'])
    })
})