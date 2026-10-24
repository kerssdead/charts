import { toKeyedSectors } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Converting sectors to keyed sectors', () => {
    it('Should use sector index as key and keep sector reference', () => {
        const sectors = [new Sector({ value: 1 }), new Sector({ value: 2 })]

        expect(toKeyedSectors(sectors))
            .toEqual([{ sector: sectors[0], key: '0' }, { sector: sectors[1], key: '1' }])
        expect(toKeyedSectors(sectors)[1].sector)
            .toBe(sectors[1])
    })

    it('Should return empty array for no sectors', () => {
        expect(toKeyedSectors([]))
            .toEqual([])
    })
})