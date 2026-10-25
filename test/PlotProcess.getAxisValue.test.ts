import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot value at y coordinate', () => {
    it('Should invert y coordinate', () => {
        const process = new PlotProcess(
            { values: [createSeries(PlotType.Line, [0, 100])] } as PlotData,
            { x: 1, y: 1 },
            { valuePostfix: undefined }
        )

        expect(process.getAxisValue(process.getAxisY(37)))
            .toBeCloseTo(37)
    })

    it('Should return zero without values', () => {
        const process = new PlotProcess({ values: [] } as unknown as PlotData, { x: 1, y: 1 }, { valuePostfix: undefined })

        expect(process.getAxisValue(1000))
            .toBe(0)
    })
})