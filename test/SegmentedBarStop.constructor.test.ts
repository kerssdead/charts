import SegmentedBarStop from '@/types/SegmentedBarStop'

describe('Creating segmented bar stop', () => {
    it('Should create an empty stop without fields', () => {
        expect(new SegmentedBarStop().isPercent)
            .toBe(false)
    })

    it('Should parse percent stops with the number locale', () => {
        const stop = new SegmentedBarStop({ value: '12,5%' }, 'de-DE')

        expect([stop.isPercent, stop.value])
            .toEqual([true, 12.5])
    })

    it('Should keep plain values', () => {
        const stop = new SegmentedBarStop({ value: 7 })

        expect([stop.isPercent, stop.value])
            .toEqual([false, 7])
    })
})
