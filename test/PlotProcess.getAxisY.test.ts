import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot y coordinate', () => {
    it('Should grow upwards from bottom of plot', () => {
        const process = new PlotProcess(
            { values: [createSeries(PlotType.Line, [0, 100])] } as PlotData,
            { x: 1, y: 1 },
            { valuePostfix: undefined }
        )

        expect(process.getAxisY(0))
            .toBeGreaterThan(process.getAxisY(50))
        expect(process.getAxisY(50))
            .toBeGreaterThan(process.getAxisY(100))
        expect(process.getAxisY(50) - process.getAxisY(100))
            .toBeCloseTo(process.getAxisY(0) - process.getAxisY(50))
    })
})