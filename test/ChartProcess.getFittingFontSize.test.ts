import ChartProcess from '@/render/ChartProcess'
import Data from '@/types/interfaces/Data'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

class TestProcess extends ChartProcess<Data> {
    getData() {
        return []
    }

    fitFont(text: string, availableWidth: number, maxFontSize: number) {
        return this.getFittingFontSize(text, availableWidth, maxFontSize)
    }
}

const process = new TestProcess({ values: [] } as unknown as Data, { x: 1, y: 1 }, { valuePostfix: undefined })

describe('Getting fitting font size', () => {
    it('Should scale font to fill available width', () => {
        expect(process.fitFont('abcd', 20, 16))
            .toBe(10)
    })

    it('Should not exceed max font size', () => {
        expect(process.fitFont('abcd', 100, 16))
            .toBe(16)
    })
})