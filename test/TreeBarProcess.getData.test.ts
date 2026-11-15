import { LIGHT_THEME } from '@/Theme'

import TreeBarProcess from '@/render/treeBar/TreeBarProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemText from '@/types/RenderItemText'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'
import ProcessSettings from '@/types/ProcessSettings'
import RenderItemImage from '@/types/RenderItemImage'
import { ImageCrossOrigin } from '@/static/Enums'
import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'
import { createState } from './ViewStateTestData'
import { DARK_THEME } from './TestTheme'
import { MUTED_ALPHA } from '@/render/treeBar/TreeBarConstants'
import { withAlpha } from '@/helpers/Color'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 1000, y: 5000 / 400 }

const SETTINGS: ProcessSettings = { valuePostfix: undefined, theme: LIGHT_THEME }

const BAR = { x: 104 * PIXEL.x, width: 880 * PIXEL.x }

const part = (value: number) => new Sector({ value, color: '#ff0000' })

const row = (id: string, values: number[], extra: Partial<TreeBarRow> = {}) => {
    return new TreeBarRow({ id, label: id, parts: values.map(part), ...extra })
}

function create(
    data: Partial<TreeBarData>,
    state = createState(data),
    settings = SETTINGS
) {
    return new TreeBarProcess({ values: [], ...data } as TreeBarData, PIXEL, settings, state)
}

function getItems(process: TreeBarProcess) {
    return new Map<string, RenderItem>(QueueItemsBuilder.build([...process.getFixedData(), ...process.getData()]).map(item => [item.key ?? '', item]))
}

const rect = (items: Map<string, RenderItem>, key: string) => items.get(key)?.shape as RenderItemRectangle

const texts = (items: Map<string, RenderItem>, suffix: string) => {
    return [...items.values()]
        .filter(item => item.key?.endsWith(suffix))
        .sort((a, b) => (a.shape as RenderItemText).absolute.y - (b.shape as RenderItemText).absolute.y)
        .map(item => (item.shape as RenderItemText).value)
}

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
        expect((items.get('tree-bar-row-b-label-0')?.shape as RenderItemText).absolute.x - (items.get('tree-bar-row-a-label-0')?.shape as RenderItemText).absolute.x)
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
        const cells = (value?: number | string): Partial<TreeBarRow> => {
            return { cells: value === undefined ? {} : { amount: value } }
        }

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
        const state = createState(data)
        const process = create(data, state)
        const onChange = jest.fn()

        process.onChange = onChange

        getItems(process).get('tree-bar-column-amount-area')?.onClick?.()

        expect([state.sortColumn, state.isSortDescending, onChange.mock.calls.length, data.sortColumn])
            .toEqual(['amount', false, 1, undefined])

        getItems(process).get('tree-bar-column-amount-area')?.onClick?.()

        expect(state.isSortDescending)
            .toBe(true)
    })

    it('Should toggle expanded state only for rows with children', () => {
        const parent = row('a', [1], { children: [row('b', [1])] })
        const data = { values: [parent, row('c', [1])] }
        const state = createState(data)
        const process = create(data, state)
        const onChange = jest.fn()

        process.onChange = onChange

        const items = getItems(process)

        items.get('tree-bar-row-a-toggle-area')?.onClick?.()

        expect([state.isExpanded(parent), parent.expanded, onChange.mock.calls.length, items.has('tree-bar-row-c-toggle-area')])
            .toEqual([true, undefined, 1, false])
    })

    it('Should format number cells and show bar label', () => {
        const items = getItems(create({
            values: [row('a', [1], { cells: { amount: 1234.5, code: 'XY' }, barLabel: '1.2K' })],
            columns: [{ key: 'amount', title: 'Amount' }, { key: 'code', title: 'Code' }]
        }))

        expect([
            (items.get('tree-bar-row-a-cell-amount')?.shape as RenderItemText).value,
            (items.get('tree-bar-row-a-cell-code')?.shape as RenderItemText).value,
            (items.get('tree-bar-row-a-bar-label')?.shape as RenderItemText).value
        ]).toEqual([(1234.5).toLocaleString(undefined, { maximumFractionDigits: 2 }), 'XY', '1.2K'])
    })

    it('Should use the theme colours for header lines and muted text', () => {
        const items = getItems(create(
            { values: [row('A', [1])] },
            undefined,
            { ...SETTINGS, theme: DARK_THEME }
        ))
        const tickKey = [...items.keys()].find(key => {
            return key.startsWith('tree-bar-tick-') && !key.includes('-line-')
        })

        expect(items.get('tree-bar-header-line')?.color)
            .toBe(DARK_THEME.lineAxis)
        expect(tickKey && items.get(tickKey)?.color)
            .toBe(withAlpha(DARK_THEME.text, MUTED_ALPHA))
    })

    it('Should keep header in fixed data and rows in scrolling data', () => {
        const process = create({ values: [row('a', [1])], columns: [{ key: 'amount', title: 'Amount' }] })

        const keys = (actions: ReturnType<TreeBarProcess['getData']>) => QueueItemsBuilder.build(actions).map(item => item.key)

        expect([keys(process.getFixedData()).includes('tree-bar-column-amount'), keys(process.getData()).includes('tree-bar-column-amount')])
            .toEqual([true, false])
        expect(keys(process.getData()).includes('tree-bar-row-a-part-0'))
            .toBe(true)
    })

    it('Should show part label and value as tooltip text', () => {
        const items = getItems(create({ values: [row('a', [7])] }))

        expect(items.get('tree-bar-row-a-part-0')?.tooltipAt({ x: 0, y: 0 }))
            .toBe('a\n7.00')
    })

    it('Should build only rows near the scroll window', () => {
        const process = create({ values: Array.from({ length: 50 }, (_, i) => row(`r${ i }`, [1])) })
        const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

        panel.scroll = process.getScroll()
        panel.update(new CanvasWindow(500, 400))

        process.panel = panel

        const labels = texts(getItems(process), '-label-0')

        expect(labels.length)
            .toBeGreaterThan(0)
        expect(labels.length)
            .toBeLessThan(50)
        expect(labels[0])
            .toBe('r0')
    })

    it('Should recenter the built window after scrolling', () => {
        const process = create({ values: Array.from({ length: 50 }, (_, i) => row(`r${ i }`, [1])) })
        const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

        panel.scroll = process.getScroll()
        panel.update(new CanvasWindow(500, 400))
        panel.scrollTo(500)

        process.panel = panel

        const labels = texts(getItems(process), '-label-0')

        expect(labels[0])
            .toBe('r3')
        expect(labels.length)
            .toBeLessThan(50)
    })

    it('Should load row images with the chart cross-origin mode', () => {
        const process = new TreeBarProcess(
            { values: [row('a', [1], { image: 'a.png' })] } as TreeBarData,
            PIXEL,
            { ...SETTINGS, imageCrossOrigin: ImageCrossOrigin.None },
            createState()
        )

        expect((getItems(process).get('tree-bar-row-a-image')?.shape as RenderItemImage).crossOrigin)
            .toBe(ImageCrossOrigin.None)
    })

})