import { getSectorsWithSmallGroupedIntoOther } from '@/render/pie/PieSlices'
import Sector from '@/types/Sector'

jest.mock('@/Theme', () => ({ other: '#888888' }))

const isSmall = (sector: Sector) => sector.value < 10

describe('Getting sectors with small grouped into other', () => {
    it('Should replace small sectors with other sector at the end', () => {
        const sectors = [new Sector({ value: 1 }), new Sector({ value: 100 }), new Sector({ value: 2 })]

        const result = getSectorsWithSmallGroupedIntoOther(sectors, isSmall)

        expect(result.map(keyedSector => keyedSector.key))
            .toEqual(['1', 'other'])
        expect(result[1].sector.label)
            .toBe('Other')
        expect(result[1].sector.value)
            .toBe(3)
        expect(result[1].sector.color)
            .toBe('#888888')
        expect(result[1].groupedSectors)
            .toEqual([sectors[0], sectors[2]])
    })

    it('Should not group single small sector', () => {
        const sectors = [new Sector({ value: 1 }), new Sector({ value: 100 })]

        expect(getSectorsWithSmallGroupedIntoOther(sectors, isSmall).map(keyedSector => keyedSector.key))
            .toEqual(['0', '1'])
    })

    it('Should not group disabled and zero sectors', () => {
        const sectors = [
            new Sector({ value: 1 }),
            new Sector({ value: 2, disabled: true }),
            new Sector({ value: 0 }),
            new Sector({ value: 100 })
        ]

        expect(getSectorsWithSmallGroupedIntoOther(sectors, isSmall).map(keyedSector => keyedSector.key))
            .toEqual(['0', '1', '2', '3'])
    })
})