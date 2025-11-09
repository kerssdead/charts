import { PlotAxisType } from '../src/static/Enums'
import Formatter from '../src/helpers/Formatter'

describe('Getting formatted values', () => {
    it('Number', () => {
        expect(Formatter.format(1000, PlotAxisType.Number))
            .toBe('1,000.00')
    })

    it('Date', () => {
        expect(Formatter.format(new Date('2010-01-10'), PlotAxisType.Date))
            .toBe('1/10/2010')
    })

    it('Text', () => {
        expect(Formatter.format('string', PlotAxisType.Text))
            .toBe('string')
    })

    it('Number with prefix', () => {
        expect(Formatter.format(2000, PlotAxisType.Number, ' $'))
            .toBe('2,000.00 $')
    })

    it('Date with prefix', () => {
        expect(Formatter.format(new Date('2010-01-10'), PlotAxisType.Date, ' day'))
            .toBe('1/10/2010 day')
    })

    it('Text with prefix', () => {
        expect(Formatter.format('Title', PlotAxisType.Text, '.'))
            .toBe('Title.')
    })
})