import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting plot x coordinate', () => {
    it('Should grow rightwards for bar values', () => {
        const process = new PlotProcess(
            { values: [createSeries(PlotType.Bar, [0, 100])] } as PlotData,
            { x: 1, y: 1 },
            { valuePostfix: undefined }
        )

        expect(process.getAxisX(0))
            .toBeLessThan(process.getAxisX(50))
        expect(process.getAxisX(100) - process.getAxisX(50))
            .toBeCloseTo(process.getAxisX(50) - process.getAxisX(0))
    })
})