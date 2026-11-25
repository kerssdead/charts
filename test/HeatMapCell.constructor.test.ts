import HeatMapCell from '@/types/HeatMapCell'
import Value from '@/types/base/Value'

describe('Creating a heat map cell', () => {
    it('Should copy the cell fields', () => {
        const data = { text: 'extra' }
        const cell = new HeatMapCell({
            id: 'i',
            color: '#112233',
            label: 'name',
            disabled: true,
            data,
            value: 5,
            x: 'Mon',
            y: 3
        })

        expect(cell.id)
            .toBe('i')
        expect(cell.color)
            .toBe('#112233')
        expect(cell.label)
            .toBe('name')
        expect(cell.disabled)
            .toBe(true)
        expect(cell.data)
            .toBe(data)
        expect(cell.value)
            .toBe(5)
        expect(cell.x)
            .toBe('Mon')
        expect(cell.y)
            .toBe(3)
    })

    it('Should leave fields that are not given empty', () => {
        const cell = new HeatMapCell({ x: 1, y: 2 })

        expect(cell.label)
            .toBeUndefined()
        expect(cell.data)
            .toBeUndefined()
        expect(cell.disabled)
            .toBeUndefined()
    })

    it('Should be a value that cannot be toggled', () => {
        const cell = new HeatMapCell({ x: 1, y: 2, value: 3 })

        expect(cell)
            .toBeInstanceOf(Value)
        expect(cell.canToggle())
            .toBe(false)
    })

    it('Should be creatable without fields', () => {
        expect(new HeatMapCell().x)
            .toBeUndefined()
    })
})