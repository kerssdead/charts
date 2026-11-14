import PlotSeries from '@/types/PlotSeries'

describe('Toggling plot series', () => {
    it('Should allow toggling a plot series', () => {
        expect(new PlotSeries({}).canToggle())
            .toBe(true)
    })
})
