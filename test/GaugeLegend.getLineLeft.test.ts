import { getLineLeft, LegendItem } from '@/render/gauge/GaugeLegend'

const item = (width: number): LegendItem => ({ key: 'a', text: 'a', color: '#ff0000', width })

describe('Getting gauge legend line left', () => {
    it('Should center items with spacing in canvas width', () => {
        expect(getLineLeft([item(40), item(40)], 200))
            .toBe(52)
    })

    it('Should center single item', () => {
        expect(getLineLeft([item(50)], 200))
            .toBe(75)
    })
})