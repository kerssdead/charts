import TableView from '@/export/TableView'
import TableData from '@/types/TableData'
import TextResources from '@/static/TextResources'
import { AriaRole, Attribute, TableClasses } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const build = (data: TableData) => new TableView(data).element as unknown as FakeElement

const sections = (table: FakeElement) => table.elements.map(child => [...child.classes][0])

const texts = (row: FakeElement) => row.elements.map(cell => cell.text)

const data: TableData = {
    headers: [{ value: 'amount', display: 'Amount' }, { value: 'share', display: 'Share', percent: true }],
    values: [
        { name: 'One', color: '#ff0000', values: new Map([['amount', 1], ['share', 25]]) },
        { name: 'Two', level: 1, disabled: true, values: new Map([['amount', 3]]) }
    ]
}

describe('Building table view', () => {
    beforeEach(installFakeDocument)

    it('Should build header, body, footer and column highlight', () => {
        expect(sections(build(data)))
            .toEqual([TableClasses.Header, TableClasses.Body, TableClasses.Footer, TableClasses.ColumnHighlight])
    })

    it('Should set table role and value column count', () => {
        const table = build(data)

        expect([table.getAttribute(Attribute.Role), table.style['--o-value-columns']])
            .toEqual([AriaRole.Table, '2'])
    })

    it('Should label the header and footer corners', () => {
        const [header, , footer] = build(data).elements

        expect([texts(header)[0], texts(footer)[0]])
            .toEqual([TextResources.name, TextResources.total])
    })

    it('Should give header cells tooltips and number alignment for value columns', () => {
        const [header] = build(data).elements
        const [name, amount] = header.elements

        expect([
            amount.title,
            amount.classList.contains(TableClasses.Number),
            name.classList.contains(TableClasses.Number)
        ])
            .toEqual(['Amount', true, false])
    })

    it('Should set accessibility roles on rows and cells', () => {
        const [header, body, footer] = build(data).elements
        const roles = (row: FakeElement) => {
            return [
                row.getAttribute(Attribute.Role),
                ...row.elements.map(cell => cell.getAttribute(Attribute.Role))
            ]
        }

        expect([roles(header), body.getAttribute(Attribute.Role), roles(body.elements[0]), roles(footer)])
            .toEqual([
                [AriaRole.Row, AriaRole.ColumnHeader, AriaRole.ColumnHeader, AriaRole.ColumnHeader],
                AriaRole.RowGroup,
                [AriaRole.Row, AriaRole.RowHeader, AriaRole.Cell, AriaRole.Cell],
                [AriaRole.Row, AriaRole.RowHeader, AriaRole.Cell, AriaRole.Cell]
            ])
    })

    it('Should format values with percent columns and empty missing values', () => {
        const [, body] = build(data).elements

        expect(body.elements.map(row => texts(row).slice(1)))
            .toEqual([['1.00', '25.00%'], ['3.00', '']])
    })

    it('Should total top level rows in the footer with tooltips', () => {
        const [, , footer] = build(data).elements
        const [, amount, share] = footer.elements

        expect([amount.text, amount.title, share.text])
            .toEqual(['1.00', `${ TextResources.total }: 1.00`, '25.00%'])
    })

    it('Should show a color swatch before the name', () => {
        const [, body] = build(data).elements
        const [swatch, name] = body.elements[0].elements[0].children as [FakeElement, string]

        const isSwatch = swatch.classList.contains(TableClasses.Swatch)

        expect([isSwatch, swatch.style.color, swatch.getAttribute(Attribute.AriaHidden), name])
            .toEqual([true, '#ff0000', 'true', 'One'])
    })

    it('Should indent child rows and mark disabled rows', () => {
        const [, body] = build(data).elements
        const [first, second] = body.elements

        const levels = [first, second].map(row => row.elements[0].style['--o-level'])

        expect([levels, second.classList.contains(TableClasses.Disabled)])
            .toEqual([[undefined, '1'], true])
    })

    it('Should show a single no data row without footer when there are no rows', () => {
        const table = build({ headers: data.headers, values: [] })
        const [, body] = table.elements
        const empty = body.elements[0].elements[0]

        expect([sections(table), empty.text, empty.classList.contains(TableClasses.Empty)])
            .toEqual([[TableClasses.Header, TableClasses.Body], TextResources.noData, true])
    })

    it('Should keep a valid column count and show no data without value columns', () => {
        const table = build({ headers: [], values: data.values })

        expect([table.style['--o-value-columns'], table.elements[1].elements[0].elements[0].text])
            .toEqual(['1', TextResources.noData])
    })

    it('Should build a body with more rows than the call stack argument limit', () => {
        const values = Array.from({ length: 200000 }, (_, index) => ({ name: `${ index }`, values: new Map([['value', index]]) }))

        const table = build({ headers: [{ value: 'value', display: 'Value' }], values })

        expect(table.elements[1].children.length)
            .toBe(200000)
    })
})