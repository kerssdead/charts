import TreeBarProcess from '@/render/TreeBarProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemText from '@/types/RenderItemText'
import TreeBarData, { getTreeBarRows } from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'
import ProcessSettings from '@/types/ProcessSettings'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000', lineAxis: '#e0e0e0' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 1000, y: 5000 / 400 }

const SETTINGS: ProcessSettings = { valuePostfix: undefined }

const BAR = { x: 104 * PIXEL.x, width: 880 * PIXEL.x }

const part = (value: number) => new Sector({ value, color: '#ff0000' })

const row = (id: string, values: number[], extra: Partial<TreeBarRow> = {}) =>
    new TreeBarRow({ id, label: id, parts: values.map(part), ...extra })

function create(data: Partial<TreeBarData>) {
    return new TreeBarProcess({ values: [], ...data } as TreeBarData, PIXEL, SETTINGS)
}

function getItems(process: TreeBarProcess) {
    return new Map<string, RenderItem>(QueueItemsBuilder.build([...process.getFixedData(), ...process.getData()]).map(item => [item.key!, item]))
}

const rect = (items: Map<string, RenderItem>, key: string) => items.get(key)!.shape as RenderItemRectangle

const texts = (items: Map<string, RenderItem>, suffix: string) =>
    [...items.values()]
        .filter(item => item.key!.endsWith(suffix))
        .sort((a, b) => (a.shape as RenderItemText).absolute.y - (b.shape as RenderItemText).absolute.y)
        .map(item => (item.shape as RenderItemText).value)

describe('Getting tree bar data', () => {
    it('Should show only top level rows when collapsed', () => {
        const process = create({ values: [row('a', [10], { children: [row('b', [5])] }), row('c', [20])] })
        const items = getItems(process)

        expect(texts(items, '-label-0'))
            .toEqual(['a', 'c'])
        expect(process.getScroll())
            .toEqual({ top: 32, height: 32 + 36 * 2 })
    })

    it('Should show children of expanded rows with indent', () => {
        const items = getItems(create({ values: [row('a', [10], { expanded: true, children: [row('b', [5])] })] }))

        expect(texts(items, '-label-0'))
            .toEqual(['a', 'b'])
        expect((items.get('tree-bar-row-b-label-0')!.shape as RenderItemText).absolute.x - (items.get('tree-bar-row-a-label-0')!.shape as RenderItemText).absolute.x)
            .toBeCloseTo(16 * PIXEL.x)
    })

    it('Should stack parts and scale bars to rounded max', () => {
        const items = getItems(create({ values: [row('a', [10, 20]), row('b', [60])] }))

        expect(rect(items, 'tree-bar-row-a-part-0').absolute.x)
            .toBeCloseTo(BAR.x)
        expect(rect(items, 'tree-bar-row-a-part-1').absolute.x)
            .toBeCloseTo(BAR.x + BAR.width / 6)
        expect(rect(items, 'tree-bar-row-a-part-1').absolute.width)
            .toBeCloseTo(BAR.width / 3)
        expect(rect(items, 'tree-bar-row-b-part-0').absolute.width)
            .toBeCloseTo(BAR.width)
    })

    it('Should treat parts without value as zero when scaling bars', () => {
        const items = getItems(create({ values: [row('a', [60], { children: [new TreeBarRow({ id: 'b', label: 'b', parts: [new Sector({ color: '#ff0000' })] })] })] }))

        expect(rect(items, 'tree-bar-row-a-part-0').absolute.width)
            .toBeCloseTo(BAR.width)
    })

    it('Should grow row height for multiline label and sub label', () => {
        const process = create({ values: [row('a', [1], { label: 'Lorem\nIpsum', subLabel: 'Dolor' })] })

        expect(texts(getItems(process), '-label-1'))
            .toEqual(['Ipsum'])
        expect(process.getScroll().height)
            .toBe(32 + 15 * 3 + 6 * 2)
    })

    it('Should sort siblings by column and keep missing values last', () => {
        const cells = (value?: number | string): Partial<TreeBarRow> => ({ cells: value == undefined ? {} : { amount: value } })

        const values = [
            row('a', [1], { ...cells(5), expanded: true, children: [row('a1', [1], cells(2)), row('a2', [1], cells(1))] }),
            row('b', [1], cells()),
            row('c', [1], cells('1,000'))
        ]

        const columns = [{ key: 'amount', title: 'Amount' }]

        expect(texts(getItems(create({ values, columns, sortColumn: 'amount' })), '-label-0'))
            .toEqual(['a', 'a2', 'a1', 'c', 'b'])
        expect(texts(getItems(create({ values, columns, sortColumn: 'amount', sortDescending: true })), '-label-0'))
            .toEqual(['c', 'a', 'a1', 'a2', 'b'])
    })

    it('Should toggle sort direction by header click', () => {
        const data = { values: [row('a', [1])], columns: [{ key: 'amount', title: 'Amount' }] } as TreeBarData
        const process = new TreeBarProcess(data, PIXEL, SETTINGS)
        const onChange = jest.fn()

        process.onChange = onChange

        getItems(process).get('tree-bar-column-amount-area')!.onClick!()

        expect([data.sortColumn, data.sortDescending, onChange.mock.calls.length])
            .toEqual(['amount', false, 1])

        getItems(process).get('tree-bar-column-amount-area')!.onClick!()

        expect(data.sortDescending)
            .toBe(true)
    })

    it('Should toggle expanded state only for rows with children', () => {
        const parent = row('a', [1], { children: [row('b', [1])] })
        const process = create({ values: [parent, row('c', [1])] })
        const onChange = jest.fn()

        process.onChange = onChange

        const items = getItems(process)

        items.get('tree-bar-row-a-toggle-area')!.onClick!()

        expect([parent.expanded, onChange.mock.calls.length, items.has('tree-bar-row-c-toggle-area')])
            .toEqual([true, 1, false])
    })

    it('Should format number cells and show bar label', () => {
        const items = getItems(create({
            values: [row('a', [1], { cells: { amount: 1234.5, code: 'XY' }, barLabel: '1.2K' })],
            columns: [{ key: 'amount', title: 'Amount' }, { key: 'code', title: 'Code' }]
        }))

        expect([
            (items.get('tree-bar-row-a-cell-amount')!.shape as RenderItemText).value,
            (items.get('tree-bar-row-a-cell-code')!.shape as RenderItemText).value,
            (items.get('tree-bar-row-a-bar-label')!.shape as RenderItemText).value
        ]).toEqual([(1234.5).toLocaleString(undefined, { maximumFractionDigits: 2 }), 'XY', '1.2K'])
    })

    it('Should keep header in fixed data and rows in scrolling data', () => {
        const process = create({ values: [row('a', [1])], columns: [{ key: 'amount', title: 'Amount' }] })

        const keys = (actions: ReturnType<TreeBarProcess['getData']>) => QueueItemsBuilder.build(actions).map(item => item.key)

        expect([keys(process.getFixedData()).includes('tree-bar-column-amount'), keys(process.getData()).includes('tree-bar-column-amount')])
            .toEqual([true, false])
        expect(keys(process.getData()).includes('tree-bar-row-a-part-0'))
            .toBe(true)
    })

    it('Should export top level rows with column values', () => {
        const table = getTreeBarRows({
            values: [row('a', [1], { label: 'Lorem\nIpsum', cells: { amount: '1,500', code: 'XY' }, children: [row('b', [1])] })],
            columns: [{ key: 'amount', title: 'Amount' }, { key: 'code', title: 'Code' }]
        } as TreeBarData)

        expect([table.headers.map(header => header.display), table.values.map(value => [value.name, [...value.values.values()]])])
            .toEqual([['Amount', 'Code'], [['Lorem Ipsum', [1500, 0]]]])
    })

    it('Should export part totals without columns', () => {
        const table = getTreeBarRows({ values: [row('a', [10, 20])] } as TreeBarData)

        expect([...table.values[0].values.values()])
            .toEqual([30])
    })
})
