import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const create = (values: PlotData['values']) =>
    new PlotProcess({ values } as PlotData, { x: 1, y: 1 }, { valuePostfix: undefined })

describe('Checking plot emptiness', () => {
    it('Should be empty without series or values', () => {
        expect(create([]).isEmpty())
            .toBe(true)
        expect(create([createSeries(PlotType.Line, [])]).isEmpty())
            .toBe(true)
    })

    it('Should be empty when only disabled series have values', () => {
        expect(create([createSeries(PlotType.Line, [1], { disabled: true })]).isEmpty())
            .toBe(true)
    })

    it('Should not be empty with enabled values', () => {
        expect(create([createSeries(PlotType.Line, []), createSeries(PlotType.Column, [0])]).isEmpty())
            .toBe(false)
    })
})