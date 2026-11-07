import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'

const formatTicks = (values: (number | Date | string)[], type = PlotAxisType.Date) => {
    return Formatter.axisTicks(values, type).map(label => label.replace(/\s/g, ' '))
}

describe('Getting formatted axis ticks', () => {
    it('Should keep values of non date axis', () => {
        expect(formatTicks([5, 'Day'], PlotAxisType.Number))
            .toEqual(['5', 'Day'])
    })

    it('Should format midnight ticks as date and others as time', () => {
        expect(formatTicks([new Date(2025, 0, 5, 18), new Date(2025, 0, 6), new Date(2025, 0, 6, 6, 30)]))
            .toEqual(['6:00 PM', '1/6/2025', '6:30 AM'])
    })

    it('Should show seconds on all ticks when any tick has seconds', () => {
        expect(formatTicks([new Date(2025, 0, 5, 9, 17), new Date(2025, 0, 5, 9, 17, 15)]))
            .toEqual(['9:17:00 AM', '9:17:15 AM'])
    })

    it('Should format timestamps and date strings', () => {
        expect(formatTicks([new Date(2025, 0, 5, 9).getTime(), '2025-01-06']))
            .toEqual(['9:00 AM', '1/6/2025'])
    })
})