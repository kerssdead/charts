import Formatter from '@/helpers/Formatter'
import { PlotAxisType } from '@/static/Enums'

const withPlainSpaces = (text: string) => text.replace(/\s/g, ' ')

describe('Getting formatted axis value', () => {
    it('Date', () => {
        expect(Formatter.axis(new Date(2011, 11, 30), PlotAxisType.Date))
            .toBe('12/30/2011')
    })

    it('Date string', () => {
        expect(Formatter.axis('2011-12-30', PlotAxisType.Date))
            .toBe('12/30/2011')
    })

    it('Date with time', () => {
        expect(withPlainSpaces(Formatter.axis(new Date(2025, 0, 5, 9, 30), PlotAxisType.Date)))
            .toBe('1/5/2025, 9:30 AM')
    })

    it('Date with seconds', () => {
        expect(withPlainSpaces(Formatter.axis(new Date(2025, 0, 5, 9, 30, 15), PlotAxisType.Date)))
            .toBe('1/5/2025, 9:30:15 AM')
    })

    it('Text', () => {
        expect(Formatter.axis('Test string', PlotAxisType.Text))
            .toBe('Test string')
    })
})