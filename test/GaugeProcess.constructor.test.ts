import GaugeProcess from '@/render/gauge/GaugeProcess'
import GaugeData from '@/types/data/GaugeData'
import Sector from '@/types/Sector'
import { ErrorType } from '@/static/Enums'

jest.mock('@/Theme', () => ({ canvasBackground: '#ffffff', text: '#000000' }))

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const create = (min: number, max: number) => {
    const data = { values: [new Sector({ value: 1 })], min, max } as GaugeData

    return new GaugeProcess(data, { x: 5, y: 12.5 }, { valuePostfix: undefined })
}

describe('Creating gauge process', () => {
    it('Should fail when min is greater than max', () => {
        expect(() => create(10, 0))
            .toThrow(ErrorType.InvalidGaugeRange)
    })

    it('Should accept equal min and max', () => {
        expect(() => create(5, 5))
            .not.toThrow()
    })
})