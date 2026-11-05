import Decomposition from '@/export/Decomposition'
import ChartItem from '@/types/ChartItem'
import TextResources from '@/static/TextResources'
import { ChartType, Events, TableClasses } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const pie = (count: number, title?: string) => {
    const values = Array.from({ length: count }, (_, index) => ({ label: `Item ${ index }`, value: index + 1 }))

    return { type: ChartType.Pie, title, data: { values } } as unknown as ChartItem
}

function create(charts: ChartItem[]) {
    installFakeDocument()

    const onSave = jest.fn()
    const container = Decomposition.fromCharts(charts, onSave) as unknown as FakeElement
    const [toolbar, list] = container.elements

    return { container, toolbar, list, onSave }
}

describe('Building decomposition from charts', () => {
    it('Should put a toolbar above the table list', () => {
        const { container } = create([pie(2)])

        expect(container.elements.map(child => [...child.classes][0]))
            .toEqual([TableClasses.Toolbar, TableClasses.List])
    })

    it('Should show a single table without caption', () => {
        const { list } = create([pie(2, 'Ignored')])

        expect(list.elements.map(child => [...child.classes][0]))
            .toEqual([TableClasses.Table])
    })

    it('Should caption titled tables when there are several charts', () => {
        const { list } = create([pie(2, 'First'), pie(2)])
        const [group, table] = list.elements

        expect([group.elements[0].text, [...table.classes][0]])
            .toEqual(['First', TableClasses.Table])
    })

    it('Should show the filter only when a table has more than ten rows', () => {
        const filters = (count: number) => create([pie(count)]).toolbar.findByClass(TableClasses.Filter).length

        expect([filters(10), filters(11)])
            .toEqual([0, 1])
    })

    it('Should filter every table', () => {
        const { toolbar, list } = create([pie(11), pie(11)])
        const [filter] = toolbar.elements

        filter.value = 'Item 10'
        filter.dispatch(Events.Input)

        const visible = list.findByClass(TableClasses.Row).filter(row => !row.hidden)

        expect(visible.length)
            .toBe(2)
    })

    it('Should copy every table as text', async () => {
        const writeText = jest.fn(() => Promise.resolve())

        Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText } }, configurable: true })

        const { toolbar } = create([pie(1), pie(1)])

        toolbar.findByClass(TableClasses.Action)[0].click()

        const [text] = writeText.mock.calls[0] as unknown as [string]

        const header = `\t${ TextResources.value }\t${ TextResources.share }`

        expect(text.split('\n\n').map(block => block.split('\n')[0]))
            .toEqual([header, header])
    })

    it('Should call the save callback from the toolbar', () => {
        const { toolbar, onSave } = create([pie(1)])

        toolbar.findByClass(TableClasses.Action)[1].click()

        expect(onSave)
            .toHaveBeenCalledTimes(1)
    })
})