import Decomposition from '@/export/Decomposition'

interface FakeElement {
    className: string

    children: FakeElement[]

    classList: { add(name: string): void }

    append(child: FakeElement): void
}

function createElement(): FakeElement {
    const element: FakeElement = {
        className: '',
        children: [],
        classList: { add: name => element.className = name },
        append: child => element.children.push(child)
    }

    return element
}

describe('Building decomposition table', () => {
    it('Should build a body with more rows than the call stack argument limit', () => {
        Object.assign(globalThis, { document: { createElement } })

        const values = Array.from({ length: 200000 }, (_, index) => ({ name: `${ index }`, values: new Map([['value', index]]) }))

        const table = Decomposition.toTable({ headers: [{ value: 'value', display: 'Value' }], values }) as unknown as FakeElement

        expect(table.children.map(child => child.className)).toEqual(['o-table-header', 'o-table-body', 'o-table-footer'])
        expect(table.children[1].children.length).toBe(200000)
    })
})