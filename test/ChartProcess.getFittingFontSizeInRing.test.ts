import { LIGHT_THEME } from '@/Theme'
import ChartProcess from '@/render/ChartProcess'
import Data from '@/types/interfaces/Data'
import { createState } from './ViewStateTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

type Ring = {
    radius: number
    innerRadiusRatio: number
}

class TestProcess extends ChartProcess<Data> {
    getData() {
        return []
    }

    fitFontInRing(text: string, ring: Ring, widthRatio: number, maxFontSize: number) {
        return this.getFittingFontSizeInRing(text, ring, widthRatio, maxFontSize)
    }
}

const process = new TestProcess(
    { values: [] } as unknown as Data,
    { x: 1, y: 1 },
    { valuePostfix: undefined, theme: LIGHT_THEME },
    { state: createState() }
)

describe('Getting fitting font size in ring', () => {
    it('Should fit text into the share of the inner diameter', () => {
        expect(process.fitFontInRing('abcd', { radius: 50, innerRadiusRatio: .5 }, .4, 100))
            .toBe(10)
    })

    it('Should not exceed max font size', () => {
        expect(process.fitFontInRing('abcd', { radius: 50, innerRadiusRatio: .5 }, .4, 8))
            .toBe(8)
    })

    it('Should give zero size for a ring without hole', () => {
        expect(process.fitFontInRing('abcd', { radius: 50, innerRadiusRatio: 0 }, .4, 16))
            .toBe(0)
    })
})