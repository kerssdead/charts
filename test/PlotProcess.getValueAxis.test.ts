import { LIGHT_THEME } from '@/Theme'

import PlotProcess from '@/render/plot/PlotProcess'
import PlotData from '@/types/data/PlotData'
import { createSeries } from './PlotTestData'
import { PlotType } from '@/static/Enums'
import { createState } from './ViewStateTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const create = (values: PlotData['values']) => {
    return new PlotProcess(
        { values } as PlotData,
        { x: 1, y: 1 },
        { valuePostfix: undefined, theme: LIGHT_THEME },
        createState({ values })
    )
}

describe('Getting plot value axis', () => {
    it('Should map values to plot coordinates', () => {
        const process = create([createSeries(PlotType.Line, [0, 100])])
        const axis = process.getValueAxis()

        expect([axis.getAxisY(37), axis.getAxisValue(process.getAxisY(37))])
            .toEqual([process.getAxisY(37), process.getAxisValue(process.getAxisY(37))])
    })

    it('Should report horizontal orientation for bars', () => {
        expect(create([createSeries(PlotType.Bar, [1])]).getValueAxis().isHorizontal)
            .toBe(true)
    })
})