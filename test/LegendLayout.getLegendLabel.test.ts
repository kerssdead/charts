import { getLegendLabel } from '@/legend/LegendLayout'
import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'

describe('Getting legend label', () => {
    it('Should use the label of the value', () => {
        expect(getLegendLabel(new Sector({ label: 'A', value: 1 })))
            .toBe('A')
    })

    it('Should be empty for a value without label', () => {
        expect(getLegendLabel(new Sector({ value: 1 })))
            .toBe('')
    })

    it('Should mark a blank value', () => {
        expect(getLegendLabel(new Sector({ label: 'A', value: 0 })))
            .toBe(`A ${ TextResources.noValue }`)
    })
})
