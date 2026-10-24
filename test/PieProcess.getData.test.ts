import PieProcess from '@/render/pie/PieProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemText from '@/types/RenderItemText'
import PieData from '@/types/data/PieData'
import Sector from '@/types/Sector'
import PieProcessSettings from '@/render/pie/PieProcessSettings'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000', other: '#888888' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 800, y: 5000 / 600 }

const SMALL_PIXEL = { x: 5000 / 200, y: 5000 / 200 }

const SETTINGS: PieProcessSettings = { valuePostfix: undefined, enableOther: false }

const sector = (label: string, value: number, extra: Partial<Sector> = {}) =>
    new Sector({ label, value, color: '#ff0000', ...extra })

function create(data: Partial<PieData>, settings: Partial<PieProcessSettings> = {}, pixel = PIXEL) {
    return new PieProcess({ values: [], ...data } as PieData, pixel, { ...SETTINGS, ...settings })
}

function getItems(process: PieProcess) {
    return new Map(QueueItemsBuilder.build(process.getData()).map(item => [item.key!, item]))
}

const getArc = (items: ReturnType<typeof getItems>, key: string) => items.get(key)!.shape as RenderItemArc

const getText = (items: ReturnType<typeof getItems>, key: string) => items.get(key)!.shape as RenderItemText

describe('Getting pie data', () => {
    it('Should draw sectors proportionally to values', () => {
        const items = getItems(create({ values: [sector('A', 1), sector('B', 3)] }))

        expect([getArc(items, 'sector-0').startAngle, getArc(items, 'sector-0').endAngle])
            .toEqual([0, Math.PI / 2])
        expect([getArc(items, 'sector-1').startAngle, getArc(items, 'sector-1').endAngle])
            .toEqual([Math.PI / 2, Math.PI * 2])
    })

    it('Should show label and tooltip text', () => {
        const items = getItems(create({ values: [sector('A', 1), sector('B', 3)] }))

        expect(getText(items, 'sector-label-0').value)
            .toBe('A')
        expect(items.get('sector-0')!.tooltipTemplate)
            .toBe('A\n1.00 (25%)')
    })

    it('Should add percent to label in label percent mode', () => {
        const items = getItems(create({ values: [sector('A', 1), sector('B', 3)], labelPercent: true }))

        expect(getText(items, 'sector-label-0').value)
            .toBe('A 25%')
    })

    it('Should add value and percent to pinned sector label', () => {
        const items = getItems(create({ values: [sector('A', 1, { pinned: true }), sector('B', 3)] }))

        expect(getText(items, 'sector-label-0').value)
            .toBe('A: 1.00 (25%)')
        expect(getArc(items, 'sector-0').pull)
            .toBeGreaterThan(0)
    })

    it('Should skip label of zero sector and ghost disabled sector', () => {
        const values = [sector('A', 1), sector('B', 0), sector('C', 2, { disabled: true })]

        const items = getItems(create({ values }))

        expect(items.has('sector-label-1'))
            .toBe(false)
        expect(items.get('sector-2')!.isGhost)
            .toBe(true)
        expect(items.get('sector-label-2')!.isGhost)
            .toBe(true)
    })

    it('Should toggle pin on click and notify about change', () => {
        const values = [sector('A', 1), sector('B', 3)]
        const process = create({ values })
        const onChange = jest.fn()

        process.onChange = onChange
        getItems(process).get('sector-0')!.onClick!()

        expect(values[0].pinned)
            .toBe(true)
        expect(onChange)
            .toHaveBeenCalledTimes(1)
    })

    it('Should group small sectors into other when enabled', () => {
        const values = [sector('A', 100), sector('B', .5), sector('C', .5)]

        const items = getItems(create({ values }, { enableOther: true }))

        expect([...items.keys()].filter(key => key.startsWith('sector-') && !key.includes('label')))
            .toEqual(['sector-0', 'sector-other'])
        expect(items.get('sector-other')!.tooltipTemplate)
            .toBe('Other\n1.00 (1%)\nB: 0.50 (0.5%)\nC: 0.50 (0.5%)')
        expect(items.get('sector-other')!.onClick)
            .toBeUndefined()
    })

    it('Should not group small sectors when disabled', () => {
        const items = getItems(create({ values: [sector('A', 100), sector('B', .5), sector('C', .5)] }))

        expect(items.has('sector-other'))
            .toBe(false)
        expect(items.has('sector-2'))
            .toBe(true)
    })

    it('Should hide labels on small canvas', () => {
        const items = getItems(create({ values: [sector('A', 1), sector('B', 3)] }, {}, SMALL_PIXEL))

        expect(items.has('sector-label-0'))
            .toBe(false)
        expect(items.has('sector-0'))
            .toBe(true)
    })

    it('Should show inner title only when it fits inner radius', () => {
        const values = [sector('A', 1)]

        expect(getText(getItems(create({ values, innerRadius: 60, innerTitle: 'Total' })), 'inner-title').value)
            .toBe('Total')
        expect(getItems(create({ values, innerRadius: 0, innerTitle: 'Total' })).has('inner-title'))
            .toBe(false)
        expect(getItems(create({ values, innerRadius: 60 })).has('inner-title'))
            .toBe(false)
    })
})