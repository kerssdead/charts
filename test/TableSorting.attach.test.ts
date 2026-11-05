import TableSorting from '@/export/TableSorting'
import TableData from '@/types/TableData'
import { Attribute, SortDirection, TableClasses } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

function attach() {
    installFakeDocument()

    const data: TableData = {
        headers: [{ value: 'amount', display: 'Amount' }],
        values: [
            { name: 'b', values: new Map([['amount', 1]]) },
            { name: 'c', values: new Map([['amount', 3]]) },
            { name: 'a', values: new Map([['amount', 2]]) }
        ]
    }

    const header = new FakeElement('div')
    const body = new FakeElement('div')

    header.append(new FakeElement('div'), new FakeElement('div'))

    const rows = data.values.map(value => {
        const row = new FakeElement('div')

        row.textContent = value.name
        body.append(row)

        return row
    })

    TableSorting.attach(
        header as unknown as HTMLElement,
        body as unknown as HTMLElement,
        data,
        rows as unknown as HTMLElement[]
    )

    const [nameHeader, amountHeader] = header.elements
    const order = () => body.elements.map(row => row.textContent).join('')
    const sorts = () => header.elements.map(cell => cell.getAttribute(Attribute.AriaSort))

    return { nameHeader, amountHeader, order, sorts }
}

describe('Attaching table sorting', () => {
    it('Should mark every header cell as sortable and unsorted', () => {
        const { nameHeader, amountHeader, sorts } = attach()

        const sortable = [nameHeader, amountHeader].map(cell => cell.classList.contains(TableClasses.Sortable))

        expect([sortable, sorts()])
            .toEqual([[true, true], [SortDirection.None, SortDirection.None]])
    })

    it('Should sort by value ascending on first click', () => {
        const { amountHeader, order, sorts } = attach()

        amountHeader.click()

        expect([order(), sorts()])
            .toEqual(['bac', [SortDirection.None, SortDirection.Ascending]])
    })

    it('Should sort descending on second click', () => {
        const { amountHeader, order, sorts } = attach()

        amountHeader.click()
        amountHeader.click()

        expect([order(), sorts()])
            .toEqual(['cab', [SortDirection.None, SortDirection.Descending]])
    })

    it('Should restore the original order on third click', () => {
        const { amountHeader, order, sorts } = attach()

        amountHeader.click()
        amountHeader.click()
        amountHeader.click()

        expect([order(), sorts()])
            .toEqual(['bca', [SortDirection.None, SortDirection.None]])
    })

    it('Should sort by name from the first header cell', () => {
        const { nameHeader, order } = attach()

        nameHeader.click()

        expect(order())
            .toBe('abc')
    })

    it('Should start ascending and reset the other cell when switching columns', () => {
        const { nameHeader, amountHeader, order, sorts } = attach()

        amountHeader.click()
        amountHeader.click()
        nameHeader.click()

        expect([order(), sorts()])
            .toEqual(['abc', [SortDirection.Ascending, SortDirection.None]])
    })
})