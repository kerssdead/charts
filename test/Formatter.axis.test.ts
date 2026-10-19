import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'

describe('Getting formatted axis value', () => {
    it('Date', () => {
        expect(Formatter.axis(new Date('2011-12-30'), PlotAxisType.Date))
            .toBe('12/30/2011')
    })

    it('Date string', () => {
        expect(Formatter.axis('2011-12-30', PlotAxisType.Date))
            .toBe('12/30/2011')
    })

    it('Text', () => {
        expect(Formatter.axis('Test string', PlotAxisType.Text))
            .toBe('Test string')
    })
})