import GaugeProcess from '@/render/gauge/GaugeProcess'
import GaugeData from '@/types/data/GaugeData'
import Sector from '@/types/Sector'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const create = (values: Sector[]) =>
    new GaugeProcess({ values } as GaugeData, { x: 5, y: 12.5 }, { valuePostfix: undefined })

describe('Checking gauge emptiness', () => {
    it('Should be empty without enabled sectors', () => {
        expect(create([]).isEmpty())
            .toBe(true)
        expect(create([new Sector({ value: 1, disabled: true })]).isEmpty())
            .toBe(true)
    })

    it('Should not be empty with enabled sector', () => {
        expect(create([new Sector({ value: 0 })]).isEmpty())
            .toBe(false)
    })
})