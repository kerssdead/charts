import { toKeyedSectors } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Converting sectors to keyed sectors', () => {
    it('Should use sector id as key and keep sector reference', () => {
        const sectors = [new Sector({ id: 'a', value: 1 }), new Sector({ id: 'b', value: 2 })]

        expect(toKeyedSectors(sectors))
            .toEqual([{ sector: sectors[0], key: 'a' }, { sector: sectors[1], key: 'b' }])
        expect(toKeyedSectors(sectors)[1].sector)
            .toBe(sectors[1])
    })

    it('Should keep keys of following sectors when middle sector is removed', () => {
        const [a, b, c] = ['a', 'b', 'c'].map(id => new Sector({ id, value: 1 }))

        expect(toKeyedSectors([a, c]).map(keyedSector => keyedSector.key))
            .toEqual([toKeyedSectors([a, b, c])[0].key, toKeyedSectors([a, b, c])[2].key])
    })

    it('Should return empty array for no sectors', () => {
        expect(toKeyedSectors([]))
            .toEqual([])
    })
})