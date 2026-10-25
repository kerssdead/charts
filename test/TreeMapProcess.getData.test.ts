import TreeMapProcess from '@/render/tree/TreeMapProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemText from '@/types/RenderItemText'
import TreeData, { TreeValue } from '@/types/data/TreeData'
import Value from '@/types/base/Value'
import { spreadColor } from '@/helpers/Color'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5, y: 5 }

const value = (id: string, amount: number, extra: Partial<TreeValue> = {}) =>
    new Value({ id, label: id.toUpperCase(), value: amount, color: '#ff0000', ...extra }) as TreeValue

function getItems(data: Partial<TreeData>) {
    const process = new TreeMapProcess({ values: [], ...data } as TreeData, PIXEL, { valuePostfix: undefined })

    return new Map(QueueItemsBuilder.build(process.getData()).map(item => [item.key!, item]))
}

const getBox = (items: ReturnType<typeof getItems>, key: string) =>
    (items.get(key)!.shape as RenderItemRectangle).absolute

describe('Getting tree data', () => {
    it('Should draw values sorted descending with default gap', () => {
        const items = getItems({ values: [value('b', 1), value('a', 3)] })

        expect([...items.keys()])
            .toEqual(['tree-a', 'tree-a-label', 'tree-b', 'tree-b-label'])
        expect(getBox(items, 'tree-a'))
            .toEqual({ x: 1865, y: 2500, width: 3730, height: 5000 })
        expect(getBox(items, 'tree-b'))
            .toEqual({ x: 4375, y: 2500, width: 1250, height: 5000 })
    })

    it('Should stagger appearance by order', () => {
        const items = getItems({ values: [value('a', 3), value('b', 1)] })

        expect(items.get('tree-a')!.animation.appearDelay)
            .toBe(0)
        expect(items.get('tree-b')!.animation.appearDelay)
            .toBe(40)
    })

    it('Should skip disabled and not positive values', () => {
        const items = getItems({ values: [value('a', 1), value('b', 1, { disabled: true }), value('c', 0)] })

        expect([...items.keys()])
            .toEqual(['tree-a', 'tree-a-label'])
        expect(getBox(items, 'tree-a'))
            .toEqual({ x: 2500, y: 2500, width: 5000, height: 5000 })
    })

    it('Should apply padding and gap from data', () => {
        const items = getItems({ values: [value('a', 1), value('b', 1)], padding: 500, gap: 10 })

        expect(getBox(items, 'tree-a'))
            .toEqual({ x: 1475, y: 2500, width: 1950, height: 4000 })
        expect(getBox(items, 'tree-b'))
            .toEqual({ x: 3500, y: 2500, width: 2000, height: 4000 })
    })

    it('Should fill whole box with sectors of single group', () => {
        const group = value('g', 0, {
            color: '#808080',
            sectors: [value('s0', 1, { color: '' }), value('s1', 3, { color: '' }), value('s2', 0)]
        })

        const items = getItems({ values: [group] })

        expect([...items.keys()])
            .toEqual(['tree-g-1', 'tree-g-1-label', 'tree-g-0', 'tree-g-0-label'])
        expect(getBox(items, 'tree-g-1'))
            .toEqual({ x: 1865, y: 2500, width: 3730, height: 5000 })
        expect(items.get('tree-g-1')!.color)
            .toBe(spreadColor('#808080', 0, 2, 40))
        expect(items.get('tree-g-0')!.color)
            .toBe(spreadColor('#808080', 1, 2, 40))
        expect(items.get('tree-g-1')!.tooltipTemplate)
            .toBe('G\nS1\n3.00')
    })

    it('Should split group cell between its sectors', () => {
        const group = value('g', 0, { sectors: [value('s0', 1, { color: '#00ff00' }), value('s1', 1)] })

        const items = getItems({ values: [group, value('a', 2)] })

        expect([...items.keys()].filter(key => !key.endsWith('-label')))
            .toEqual(['tree-g-0', 'tree-g-1', 'tree-a'])
        expect(items.get('tree-g-0')!.color)
            .toBe('#00ff00')
        expect(getBox(items, 'tree-g-0'))
            .toEqual({ x: 1240, y: 1240, width: 2480, height: 2480 })
        expect(getBox(items, 'tree-g-1'))
            .toEqual({ x: 1240, y: 3750, width: 2480, height: 2500 })
    })

    it('Should show tooltip with formatted sum', () => {
        expect(getItems({ values: [value('a', 3)] }).get('tree-a')!.tooltipTemplate)
            .toBe('A\n3.00')
    })

    it('Should show label with contrast color only when it fits', () => {
        const items = getItems({ values: [value('a', 999), value('b', 1)] })

        expect((items.get('tree-a-label')!.shape as RenderItemText).value)
            .toBe('A')
        expect(items.get('tree-a-label')!.color)
            .toBe('#000000')
        expect(items.has('tree-b-label'))
            .toBe(false)
    })
})