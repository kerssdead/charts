import Legend from '@/Legend'
import { normalize } from '@/helpers/Settings'
import { ChartType, LegendPlace } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

globalThis.DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {
    }
} as unknown as typeof DOMRect

const legend = () => {
    const settings = normalize({
        type: ChartType.Pie,
        legendPlace: LegendPlace.Bottom,
        disableInteractions: true,
        enableLegend: true,
        data: { values: [1, 2, 3].map(index => ({ label: `Label ${ index }`, value: index })) }
    } as unknown as ChartSettings)

    return new Legend(settings)
}

describe('Getting current legend reserved size', () => {
    it('Should reserve nothing before the legend is sized', () => {
        expect(legend().getCurrentReserved(0))
            .toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    })

    it('Should match settled reserved size when legend is not moving', () => {
        const bottom = legend()

        bottom.resize(400, 400)

        expect(bottom.getCurrentReserved(0))
            .toEqual(bottom.reserved)
    })
})