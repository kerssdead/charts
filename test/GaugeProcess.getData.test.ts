import GaugeProcess from '@/render/gauge/GaugeProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemArc from '@/types/RenderItemArc'
import RenderItemText from '@/types/RenderItemText'
import GaugeData from '@/types/data/GaugeData'
import Sector from '@/types/Sector'
import ProcessSettings from '@/types/ProcessSettings'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 1000, y: 5000 / 400 }

const TINY_PIXEL = { x: 5000 / 100, y: 5000 / 50 }

const SETTINGS: ProcessSettings = { valuePostfix: undefined }

const sector = (label: string, value: number, extra: Partial<Sector> = {}) => {
    return new Sector({ id: label, label, value, color: '#ff0000', ...extra })
}

function getItems(data: Partial<GaugeData>, pixel = PIXEL) {
    const process = new GaugeProcess({ values: [], ...data } as GaugeData, pixel, SETTINGS)

    return new Map(QueueItemsBuilder.build(process.getData()).map(item => [item.key ?? '', item]))
}

const getArc = (items: ReturnType<typeof getItems>, key: string) => items.get(key)?.shape as RenderItemArc

const getText = (items: ReturnType<typeof getItems>, key: string) => items.get(key)?.shape as RenderItemText

describe('Getting gauge data', () => {
    it('Should draw value ring proportionally to range', () => {
        const items = getItems({ values: [sector('Speed', 42)] })

        expect(getArc(items, 'gauge-value-Speed').startAngle)
            .toBe(Math.PI)
        expect(getArc(items, 'gauge-value-Speed').endAngle)
            .toBeCloseTo(Math.PI * 1.42)
        expect(items.get('gauge-value-Speed')?.tooltipTemplate)
            .toBe('Speed\n42.00 (42%)')
    })

    it('Should keep value ring key of following sector when first sector is removed', () => {
        const items = getItems({ values: [sector('B', 20)] })

        expect(getArc(items, 'gauge-value-B').endAngle)
            .toBe(getArc(getItems({ values: [sector('A', 10), sector('B', 20)] }), 'gauge-value-B').endAngle)
    })

    it('Should clamp value and treat not finite value as min', () => {
        const items = getItems({ values: [sector('A', 150), sector('B', NaN)] })

        expect(getArc(items, 'gauge-value-A').endAngle)
            .toBeCloseTo(Math.PI * 2)
        expect(getArc(items, 'gauge-value-B').endAngle)
            .toBe(Math.PI)
    })

    it('Should show real percentage in tooltip for values outside range', () => {
        const items = getItems({ values: [sector('A', 130), sector('B', -20), sector('C', 60)] })
        const offset = getItems({ values: [sector('D', 60)], min: 20, max: 50 })

        expect([items.get('gauge-value-A')?.tooltipTemplate, items.get('gauge-value-B')?.tooltipTemplate])
            .toEqual(['A\n130.00 (130%)', 'B\n-20.00 (-20%)'])
        expect(offset.get('gauge-value-D')?.tooltipTemplate)
            .toBe('D\n60.00 (133.3%)')
    })

    it('Should mark single value above max and below min', () => {
        const above = getItems({ values: [sector('A', 130)] })
        const below = getItems({ values: [sector('A', -20)] })
        const atMax = getItems({ values: [sector('A', 100)] })

        expect([above, below, atMax].map(items => getText(items, 'gauge-value-label').value))
            .toEqual(['130.00 ▲', '-20.00 ▼', '100.00'])
    })

    it('Should mark legend values outside range', () => {
        const items = getItems({ values: [sector('A', 130), sector('B', -20), sector('C', 50)] })

        expect(['gauge-label-0', 'gauge-label-1', 'gauge-label-2'].map(key => getText(items, key).value))
            .toEqual(['A: 130.00 ▲', 'B: -20.00 ▼', 'C: 50.00'])
    })

    it('Should not mark missing value', () => {
        const items = getItems({ values: [sector('A', null as unknown as number)], min: 20 })

        expect(getText(items, 'gauge-value-label').value)
            .not.toMatch(/[▲▼]/)
    })

    it('Should treat value as min when min equals max', () => {
        const items = getItems({ values: [sector('A', 5)], min: 5, max: 5 })

        expect(getArc(items, 'gauge-value-A').endAngle)
            .toBe(Math.PI)
    })

    it('Should draw full track only when enabled', () => {
        expect(getItems({ values: [sector('A', 1)] }).has('gauge-track-0'))
            .toBe(false)
        expect(getArc(getItems({ values: [sector('A', 1)], enableTrack: true }), 'gauge-track-0').endAngle)
            .toBeCloseTo(Math.PI * 2)
    })

    it('Should draw range and step labels unless steps are disabled', () => {
        const items = getItems({ values: [sector('A', 1)] })

        const keys = ['gauge-min', 'gauge-max', 'gauge-step-0', 'gauge-step-1', 'gauge-step-2']

        expect(keys.every(key => items.has(key)))
            .toBe(true)
        expect(getItems({ values: [sector('A', 1)], disableStepLabels: true }).has('gauge-step-0'))
            .toBe(false)
    })

    it('Should put single value inside ring when it fits', () => {
        const items = getItems({ values: [sector('Speed', 42)] })

        expect(getText(items, 'gauge-value-label').fontSize)
            .toBe(32)
        expect(getText(items, 'gauge-label').value)
            .toBe('Speed')
    })

    it('Should put single value below ring without inner radius', () => {
        const items = getItems({ values: [sector('Speed', 42)], innerRadius: 0 })

        expect(getText(items, 'gauge-value-label').fontSize)
            .toBe(16)
    })

    it('Should draw legend for several values and skip disabled', () => {
        const items = getItems({ values: [sector('A', 1), sector('B', 2, { disabled: true }), sector('C', 3)] })

        expect(items.has('gauge-value-C') && !items.has('gauge-value-B'))
            .toBe(true)
        expect(getText(items, 'gauge-label-1').value)
            .toBe('C: 3.00')
        expect(items.has('gauge-label-1-marker'))
            .toBe(true)
        expect(items.has('gauge-value-label'))
            .toBe(false)
    })

    it('Should return no data without values or room', () => {
        expect(getItems({ values: [sector('A', 1, { disabled: true })] }).size)
            .toBe(0)
        expect(getItems({ values: [sector('A', 1)] }, TINY_PIXEL).size)
            .toBe(0)
    })
})