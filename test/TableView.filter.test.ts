import TableView from '@/export/TableView'
import TableData from '@/types/TableData'
import { FakeElement, installFakeDocument } from './FakeDocument'

const data: TableData = {
    headers: [{ value: 'amount', display: 'Amount' }],
    values: [
        { name: 'Fruits', values: new Map([['amount', 1]]) },
        { name: 'Lemon', level: 1, values: new Map([['amount', 1]]) },
        { name: 'Vegetables', values: new Map([['amount', 1]]) }
    ]
}

function create() {
    installFakeDocument()

    const view = new TableView(data)
    const body = (view.element as unknown as FakeElement).elements[1]
    const visible = () => body.elements.filter(row => !row.hidden).map(row => row.elements[0].text)

    return { view, visible }
}

describe('Filtering table view', () => {
    it('Should hide rows that do not match and keep ancestors of matches', () => {
        const { view, visible } = create()

        view.filter('lem')

        expect(visible())
            .toEqual(['Fruits', 'Lemon'])
    })

    it('Should show every row again for an empty query', () => {
        const { view, visible } = create()

        view.filter('lem')
        view.filter('')

        expect(visible())
            .toEqual(['Fruits', 'Lemon', 'Vegetables'])
    })

    it('Should keep filtering after rows are sorted', () => {
        const { view, visible } = create()
        const header = (view.element as unknown as FakeElement).elements[0]

        header.elements[0].click()
        header.elements[0].click()
        view.filter('veg')

        expect(visible())
            .toEqual(['Vegetables'])
    })
})