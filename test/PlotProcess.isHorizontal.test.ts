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

describe('Checking plot orientation', () => {
    it('Should be horizontal with only bars', () => {
        expect(create([createSeries(PlotType.Bar, [1])]).isHorizontal)
            .toBe(true)
    })

    it('Should not be horizontal with other series', () => {
        expect(create([createSeries(PlotType.Bar, [1]), createSeries(PlotType.Line, [1])]).isHorizontal)
            .toBe(false)
    })
})