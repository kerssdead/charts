import { getSlices, toKeyedSectors } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

describe('Getting slices', () => {
    it('Should place slices one after another by value', () => {
        const sectors = [new Sector({ value: 1 }), new Sector({ value: 3 })]

        const slices = getSlices(toKeyedSectors(sectors), Math.PI / 2)

        expect(slices.map(slice => [slice.startAngle, slice.angle]))
            .toEqual([
                [0, Math.PI / 2],
                [Math.PI / 2, Math.PI * 3 / 2]
            ])
    })

    it('Should give zero angle to disabled and zero sectors', () => {
        const sectors = [
            new Sector({ value: 1 }),
            new Sector({ value: 2, disabled: true }),
            new Sector({ value: 0 })
        ]

        const slices = getSlices(toKeyedSectors(sectors), 1)

        expect(slices.map(slice => [slice.startAngle, slice.angle]))
            .toEqual([[0, 1], [1, 0], [1, 0]])
    })

    it('Should keep key and grouped sectors', () => {
        const grouped = [new Sector({ value: 1 })]
        const keyedSector = { sector: new Sector({ value: 1 }), key: 'other', groupedSectors: grouped }

        const [slice] = getSlices([keyedSector], 1)

        expect(slice.key)
            .toBe('other')
        expect(slice.groupedSectors)
            .toBe(grouped)
    })
})