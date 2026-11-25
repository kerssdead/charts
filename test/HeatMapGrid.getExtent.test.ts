import { getExtent } from '@/render/heatMap/HeatMapGrid'
import HeatMapData from '@/types/data/HeatMapData'

describe('Getting the data extent', () => {
    it('Should give the width and height', () => {
        expect(getExtent({ width: 1200, height: 800 } as HeatMapData))
            .toEqual({ width: 1200, height: 800 })
    })

    it('Should give nothing when a side is missing', () => {
        expect(getExtent({ width: 1200 } as HeatMapData))
            .toBeNull()
        expect(getExtent({ height: 800 } as HeatMapData))
            .toBeNull()
        expect(getExtent({} as HeatMapData))
            .toBeNull()
    })

    it('Should give nothing when a side is not positive', () => {
        expect(getExtent({ width: 0, height: 800 } as HeatMapData))
            .toBeNull()
        expect(getExtent({ width: 1200, height: -1 } as HeatMapData))
            .toBeNull()
    })
})