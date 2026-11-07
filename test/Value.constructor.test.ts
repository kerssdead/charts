import Value from '@/types/base/Value'
import Sector from '@/types/Sector'
import SegmentedBarStop from '@/types/SegmentedBarStop'
import TreeBarRow from '@/types/TreeBarRow'

describe('Creating a value', () => {
    it('Should copy data fields', () => {
        const value = new Value({ id: 'a', label: 'A', value: 5, color: '#f00', custom: 1 })

        expect(value)
            .toMatchObject({ id: 'a', label: 'A', value: 5, color: '#f00', custom: 1 })
    })

    it('Should ignore hasChildren field and derive it from children', () => {
        const row = new TreeBarRow({ label: 'A', hasChildren: true, children: [] })

        expect(row.label)
            .toBe('A')
        expect(row.hasChildren)
            .toBe(false)
    })

    it('Should ignore isBlank field and derive it from value', () => {
        expect(new Sector({ value: 0, isBlank: false }).isBlank)
            .toBe(true)
        expect(new SegmentedBarStop({ value: 3, isBlank: true }).isBlank)
            .toBe(false)
        expect(new Value({ isBlank: true }).isBlank)
            .toBe(false)
    })

    it('Should keep methods when data has fields with their names', () => {
        const sector = new Sector({ value: 1, reset: 'x', canToggle: false })

        sector.disabled = true
        sector.reset()

        expect(sector.disabled)
            .toBe(false)
        expect(sector.canToggle())
            .toBe(true)
    })
})