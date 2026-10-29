import TableColumnHighlight from '@/export/TableColumnHighlight'
import { Events } from '@/static/Enums'

interface FakeHighlight {
    className: string

    hidden: boolean

    style: { left?: string, width?: string, height?: string }

    classList: { add(name: string): void }
}

interface FakeCell {
    offsetLeft: number

    offsetWidth: number
}

function createElement(): FakeHighlight {
    const element: FakeHighlight = {
        className: '',
        hidden: false,
        style: {},
        classList: { add: name => element.className = name }
    }

    return element
}

function attach() {
    Object.assign(globalThis, { document: { createElement } })

    const listeners = new Map<string, (event?: unknown) => void>()
    const children: FakeHighlight[] = []

    const table = {
        scrollHeight: 500,
        addEventListener: (type: string, listener: (event?: unknown) => void) => listeners.set(type, listener),
        append: (child: FakeHighlight) => children.push(child)
    }

    TableColumnHighlight.attach(table as unknown as HTMLElement)

    const hover = (cell: FakeCell | null) => listeners.get(Events.PointerMove)!({ target: { closest: () => cell } })
    const leave = () => listeners.get(Events.PointerLeave)!()

    return { highlight: children[0], children, hover, leave }
}

describe('Attaching table column highlight', () => {
    it('Should append a single hidden highlight to the table', () => {
        const { highlight, children } = attach()

        expect([children.length, highlight.className, highlight.hidden])
            .toEqual([1, 'o-table-column-highlight', true])
    })

    it('Should cover the hovered cell column for the full table height', () => {
        const { highlight, hover } = attach()

        hover({ offsetLeft: 120, offsetWidth: 80 })

        expect([highlight.hidden, highlight.style])
            .toEqual([false, { left: '120px', width: '80px', height: '500px' }])
    })

    it('Should move to the column of a newly hovered cell', () => {
        const { highlight, hover } = attach()

        hover({ offsetLeft: 120, offsetWidth: 80 })
        hover({ offsetLeft: 200, offsetWidth: 60 })

        expect([highlight.style.left, highlight.style.width])
            .toEqual(['200px', '60px'])
    })

    it('Should hide when the pointer is not over a body cell', () => {
        const { highlight, hover } = attach()

        hover({ offsetLeft: 120, offsetWidth: 80 })
        hover(null)

        expect(highlight.hidden)
            .toBe(true)
    })

    it('Should hide when the pointer leaves the table', () => {
        const { highlight, hover, leave } = attach()

        hover({ offsetLeft: 120, offsetWidth: 80 })
        leave()

        expect(highlight.hidden)
            .toBe(true)
    })

    it('Should show again when the same cell is hovered after leaving the table', () => {
        const { highlight, hover, leave } = attach()
        const cell = { offsetLeft: 120, offsetWidth: 80 }

        hover(cell)
        leave()
        hover(cell)

        expect(highlight.hidden)
            .toBe(false)
    })
})