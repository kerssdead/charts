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

const legend = (legendPlace: LegendPlace, disableInteractions: boolean = true) => {
    const settings = normalize({
        type: ChartType.Pie,
        legendPlace,
        disableInteractions,
        enableLegend: true,
        data: { values: [1, 2, 3, 4, 5].map(index => ({ label: `Label ${ index }`, value: index })) }
    } as unknown as ChartSettings)

    return new Legend(settings)
}

describe('Resizing legend', () => {
    it('Should limit legend rows to a quarter of chart height', () => {
        const bottom = legend(LegendPlace.Bottom)

        bottom.resize(200, 400)

        expect(bottom.reserved.bottom)
            .toBe(100)
    })

    it('Should keep at least one legend row', () => {
        const bottom = legend(LegendPlace.Bottom)

        bottom.resize(200, 40)

        expect(bottom.reserved.bottom)
            .toBe(28)
    })

    it('Should use preferred width when it fits into a quarter of chart width', () => {
        const right = legend(LegendPlace.Right)

        right.resize(1000, 400)

        expect(right.reserved.right)
            .toBe(124)
    })

    it('Should limit legend width to a quarter of chart width', () => {
        const right = legend(LegendPlace.Right)

        right.resize(400, 400)

        expect(right.reserved.right)
            .toBe(100)
    })

    it('Should keep reset button width when a quarter of chart width is smaller', () => {
        const right = legend(LegendPlace.Right, false)

        right.resize(100, 400)

        expect(right.reserved.right)
            .toBe(86)
    })
})