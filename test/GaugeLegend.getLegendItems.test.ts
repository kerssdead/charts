import { getLegendItems } from '@/render/gauge/GaugeLegend'
import Sector from '@/types/Sector'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

describe('Getting gauge legend items', () => {
    it('Should build key, text, color and width with marker', () => {
        const sectors = [new Sector({ label: 'A', value: 1, color: '#ff0000' })]

        expect(getLegendItems(sectors, value => value.toString()))
            .toEqual([{ key: 'gauge-label-0', text: 'A: 1', color: '#ff0000', width: 3 + 11 + 32 }])
    })

    it('Should return empty array for no sectors', () => {
        expect(getLegendItems([], value => value.toString()))
            .toEqual([])
    })
})