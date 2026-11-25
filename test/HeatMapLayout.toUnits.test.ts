import { toUnits } from '@/render/heatMap/HeatMapLayout'
import Units from '@/helpers/Units'

describe('Converting a pixel box to units', () => {
    it('Should scale every side by the pixel size', () => {
        expect(toUnits(new Units({ x: 2, y: 3 }), { x: 10, y: 20, width: 30, height: 40 }))
            .toEqual({ x: 20, y: 60, width: 60, height: 120 })
    })

    it('Should keep an empty box empty', () => {
        expect(toUnits(new Units({ x: 5, y: 5 }), { x: 0, y: 0, width: 0, height: 0 }))
            .toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
})