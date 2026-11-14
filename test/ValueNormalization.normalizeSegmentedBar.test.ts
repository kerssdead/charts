import { normalizeSegmentedBar } from '@/helpers/ValueNormalization'
import SegmentedBarData from '@/types/data/SegmentedBarData'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'

describe('Normalizing segmented bar', () => {
    it('Should normalize values and stops', () => {
        const data = {
            values: [new Sector({ value: '1,5' })],
            stops: [new SegmentedBarStop({ value: 2, color: '#abc' })]
        } as SegmentedBarData

        normalizeSegmentedBar(data, 'de-DE')

        expect([data.values[0].value, data.stops[0].value, data.stops[0].color])
            .toEqual([1.5, 2, '#aabbcc'])
    })

    it('Should accept missing stops', () => {
        const data = { values: [new Sector({ value: '1' })] } as SegmentedBarData

        normalizeSegmentedBar(data, undefined)

        expect(data.values[0].value)
            .toBe(1)
    })
})