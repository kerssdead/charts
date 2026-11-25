import { prepareHeatMapCells } from '@/helpers/ValuePreparation'
import HeatMapData from '@/types/data/HeatMapData'
import HeatMapCell from '@/types/HeatMapCell'

const prepare = (values: object[], extra: Partial<HeatMapData> = {}) => {
    const data = { values, ...extra } as HeatMapData

    prepareHeatMapCells(data)

    return data.values
}

describe('Preparing heat map cells', () => {
    it('Should turn plain objects into cells', () => {
        expect(prepare([{ x: 'a', y: 'b', value: 1 }])[0])
            .toBeInstanceOf(HeatMapCell)
    })

    it('Should keep existing cells', () => {
        const cell = new HeatMapCell({ x: 'a', y: 'b' })

        expect(prepare([cell])[0])
            .toBe(cell)
    })

    it('Should turn labels into text', () => {
        const [cell] = prepare([{ x: 5, y: 7 }])

        expect([cell.x, cell.y])
            .toEqual(['5', '7'])
    })

    it('Should keep the coordinates of points as numbers', () => {
        const [cell] = prepare([{ x: 5, y: 7 }], { resolution: 10 })

        expect([cell.x, cell.y])
            .toEqual([5, 7])
    })

    it('Should name labeled cells by their labels', () => {
        const [cell] = prepare([{ x: 'Mon', y: '8h' }])

        expect(cell.label)
            .toBe('8h / Mon')
        expect(cell.id)
            .toBe('Mon|8h')
    })

    it('Should name points by their coordinates', () => {
        expect(prepare([{ x: 5, y: 7 }], { resolution: 10 })[0].label)
            .toBe('x 5, y 7')
    })

    it('Should keep the label and id that are given', () => {
        const [cell] = prepare([{ x: 'a', y: 'b', label: 'Mine', id: 'one' }])

        expect(cell.label)
            .toBe('Mine')
        expect(cell.id)
            .toBe('one')
    })

    it('Should keep the order of cells', () => {
        expect(prepare([{ x: 'a', y: '1' }, { x: 'b', y: '2' }]).map(cell => cell.x))
            .toEqual(['a', 'b'])
    })
})